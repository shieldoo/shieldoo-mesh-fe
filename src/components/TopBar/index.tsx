import React from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Menubar } from "primereact/menubar";
import { MenuItem } from "primereact/menuitem";
import { TabMenu } from "primereact/tabmenu";
import { classNames } from "primereact/utils";

import { useDispatch } from "../../ducks";
import useAppNavigate from "../../hooks/useAppNavigate";
import useExpertMode from "../../hooks/useExpertMode";
import { useMesh } from "../../hooks/useMesh";
import { logOut, selectors } from "../../ducks/auth";
import { getNavbarHelpItems, getNavBarItems } from "./NavBarItems";
import AccountMenu from "../AccountMenu";
import { AppRoute } from "../../AppRoute";

type Props = {
  size?: "small" | "medium" | "large" | "full";
  children?: React.ReactNode;
  hideUserMenu?: boolean;
  navigationItems?: MenuItem[];
  tabItems?: MenuItem[];
};

const defaultProps: Props = {
  size: "small",
};

function TopBar(props: Props) {
  const { size, children, hideUserMenu, navigationItems, tabItems } = {
    ...defaultProps,
    ...props,
  };

  const userProfile = useSelector(selectors.selectUserProfile);
  const isAdmin = useSelector(selectors.isAdministrator);
  const config = useSelector(selectors.selectUiConfig);
  const { isExpertModeSet, toggleExpertMode } = useExpertMode();

  const company = config?.tenantName || "<company>";
  const meshUrl = useMesh().url;
  const upn = userProfile?.upn || "<user name>"

  const dispatch = useDispatch();
  const navigate = useAppNavigate();
  const path = useLocation();

  const onLogoClick = React.useCallback(() => {
    navigate(isAdmin ? AppRoute.Home : AppRoute.ConnectMe);
  }, [isAdmin, navigate]);

  const onLogout = React.useCallback(() => dispatch(logOut()), [dispatch]);
  const onExpertMode = React.useCallback(toggleExpertMode, [toggleExpertMode]);

  const navItems: MenuItem[] = React.useMemo(
    () =>
      navigationItems ? 
      [ ...navigationItems, ...getNavbarHelpItems(upn, company, meshUrl)]
      : [
        ...getNavBarItems(isAdmin, isExpertModeSet, navigate, path.pathname),
        ...getNavbarHelpItems(upn, company, meshUrl),
      ],
    [company, isAdmin, isExpertModeSet, meshUrl, navigate, navigationItems, path.pathname, upn]
  );

  return (
    <div
      className={classNames("top-bar", {
        "top-bar-medium": size === "medium",
        "top-bar-large": size === "large",
        "top-bar-full": size === "full",
      })}
    >
      <div className="background-container">
        <div className="mask-left" />
        <div className="mask-right" />
      </div>

      <div className="top-bar-navigation">
        <div className="top-bar-left">
          <img src="/img/logo-no-text.png" alt="Shieldoo" className="cursor-pointer mr-4" onClick={onLogoClick} />
          <Menubar model={navItems} />
        </div>

        {!hideUserMenu && (
          <div className="top-bar-right">
            <AccountMenu
              userName={userProfile?.name}
              isExpertModeSet={isExpertModeSet}
              isAdministrator={isAdmin}
              onLogout={onLogout}
              onExpertMode={onExpertMode}
            />
          </div>
        )}
      </div>

      <div className="top-bar-content">{children}</div>
      {tabItems && <TabMenu model={tabItems} />}
    </div>
  );
}

export default TopBar;
