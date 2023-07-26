import { MenuItem } from "primereact/menuitem";

import { AppRoute, appRoutes, IAppRoute } from "../../AppRoute";
import * as HelpUrls from "../../Common/Constants/helpUrls";

export function getNavBarItems(
  isAdministrator: boolean,
  isExpertModeSet: boolean,
  dispatch: (type: AppRoute) => void,
  activeRoute?: string
) {
  return appRoutes
    .filter(route => checkRoute(route, isAdministrator, isExpertModeSet))
    .map(route => {
      const subRoutes = route.subRoutes
        ?.filter(route => checkRoute(route, isAdministrator, isExpertModeSet))
        .map(subRoute => {
          return {
            label: subRoute.title,
            icon: subRoute.iconClassName,
            command: () => dispatch(subRoute.path()),
          };
        });

      const item = {
        label: route.title,
        icon: route.iconClassName,
        className:
          route.path() === activeRoute || route.subRoutes?.some(s => s.path() === activeRoute) ? "p-highlight" : "",
      };
      return subRoutes
        ? convertChildToParent({ ...item, items: subRoutes })
        : { ...item, command: () => dispatch(route.path()) };
    });
}

export function getNavbarHelpItems(upn: string, company: string, meshUrl: string) {
  return [
    {
      label: "Help",
      icon: "fa-regular fa-question",
      items: [
        {
          label: "Docs",
          icon: "fa-regular fa-book",
          command: () => openInNewTab(HelpUrls.docs),
        },
        {
          label: "Report a bug",
          icon: "fa-regular fa-bug",
          command: () => openInNewTab(HelpUrls.bug),
        },
        {
          label: "Request a feature",
          icon: "fa-regular fa-lightbulb-o",
          command: () => openInNewTab(HelpUrls.feature),
        },
        {
          label: "Ask community",
          icon: "fa-regular fa-bullhorn",
          command: () => openInNewTab(HelpUrls.question),
        },
        {
          label: "Private support",
          icon: "fa-regular fa-envelope-o",
          command: () => buildMailtoSupport(upn, company, meshUrl),
        },
      ],
    },
  ];
}

function checkRoute(route: IAppRoute, isAdministrator: boolean, isExpertModeSet: boolean) {
  if (route.isHidden) {
    return false;
  }
  if (route.isAdminPage && !isAdministrator) {
    return false;
  }
  if (route.isExpertMode && !isExpertModeSet) {
    return false;
  }
  return true;
}

function buildMailtoSupport(upn: string, company: string, meshUrl: string) {
  return window.open(`mailto:support@shieldoo.io?subject=%3Cissue%20title%3E&body=-%20Company%3A%20${company}%0D%0A-%20Domain%20name%3A%20${meshUrl}%0D%0A-%20User%20name%3A%20${upn}%0D%0A-%20Describe%20your%20issue%3B%20please%20be%20as%20specific%20as%20possible%3A%0D%0A%0D%0ADon't%20forget%20to%20add%20the%20correct%20subject%20%3A)%0D%0A`,
    "_self",
    "noopener, noreferrer"
  );
}

function openInNewTab(url: string) {
  window.open(url, "_blank", "noopener, noreferrer");
}
function convertChildToParent(item: MenuItem) {
  if (item.items && item.items.length === 1) {
    const child = item.items[0] as MenuItem;
    child.className = item.className;
    return child;
  }
  return item;
}
