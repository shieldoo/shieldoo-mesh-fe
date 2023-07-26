import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import { IAppRoute } from "../../AppRoute";

import { selectors } from "../../ducks/auth";
import useExpertMode from "../../hooks/useExpertMode";
import { useCurrentRoute } from "../../hooks/useRoutes";
import EnableExpertMode from "./EnableExpertMode";
import NotAdministrator from "./NotAdministrator";

function Authorized({ routes }: { routes: IAppRoute[] }) {
  const currentRoute = useCurrentRoute(routes);
  const isAdministrator = useSelector(selectors.isAdministrator);
  const { isExpertModeSet } = useExpertMode();

  if (currentRoute?.isAdminPage && !isAdministrator) {
    return <NotAdministrator pageName={currentRoute.title} />;
  }

  if (currentRoute?.isExpertMode && !isExpertModeSet) {
    return <EnableExpertMode pageName={currentRoute.title} />;
  }
  return <Outlet />;
}

export default Authorized;
