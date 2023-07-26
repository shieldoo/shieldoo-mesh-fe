import { useEffect } from "react";
import { useSelector } from "react-redux";

import { AppRoute, IAppRoute } from "../../AppRoute";
import { selectors } from "../../ducks/auth";
import useAppNavigate from "../../hooks/useAppNavigate";
import useRedirectParam from "../../hooks/useRedirectParam";
import Dashboard from "../Dashboard/Dashboard";

function Home() {
  const navigate = useAppNavigate();
  const isAdmin = useSelector(selectors.isAdministrator);
  const {isRedirectSet} = useRedirectParam();

  useEffect(() => {
    if (!isAdmin && !isRedirectSet) {
      navigate(AppRoute.Installations, { replace: true });
    }
  }, [navigate, isAdmin, isRedirectSet]);

  return <Dashboard />;
}

const homeRoute: IAppRoute = {
  path: () => AppRoute.Home,
  page: <Home />,
  title: "Dashboard",
  iconClassName: "fa fa-th-large",
  isAdminPage: true,
};

export default homeRoute;
