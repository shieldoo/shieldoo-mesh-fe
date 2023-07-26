import { useCallback } from "react";
import { Avatar } from "primereact/avatar";
import { InputSwitch } from "primereact/inputswitch";
import { useSelector } from "react-redux";

import * as HelpUrls from "../../Common/Constants/helpUrls";
import { selectors } from "../../ducks/auth";
import { useGreeting } from "../../hooks/useGreeting";
import { useMeQuery, useAdminDashboardQuery } from "../../api/generated";
import FeaturedContent from "./FeaturedContent";
import useAppNavigate from "../../hooks/useAppNavigate";
import { AppRoute } from "../../AppRoute";
import Page from "../../components/Page";
import TopBar from "../../components/TopBar";
import HeaderTile from "./components/HeaderTile";
import { useMesh } from "../../hooks/useMesh";
import useExpertMode from "../../hooks/useExpertMode";

function Dashboard() {
  const navigate = useAppNavigate();
  const { greeting } = useGreeting();
  const { data: me, error: meError } = useMeQuery({});
  const { data: dashboard, error: dashboardError } = useAdminDashboardQuery({});
  const userProfile = useSelector(selectors.selectUserProfile);
  const config = useSelector(selectors.selectUiConfig);

  const company = config?.tenantName || "A Shieldoo node";
  const meshUrl = useMesh().url;

  function openInNewTab(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const onHelpTileClick = useCallback(() => {
    openInNewTab(HelpUrls.docs);
  }, []);
  const onConnectTileClick = useCallback(() => {
    navigate(AppRoute.ConnectMe);
  }, [navigate]);
  const onServersTileClick = useCallback(() => {
    navigate(AppRoute.Servers);
  }, [navigate]);
  const onUsersTileClick = useCallback(() => {
    navigate(AppRoute.Users);
  }, [navigate]);

  const { isExpertModeSet, toggleExpertMode } = useExpertMode();
  const onExpertMode = useCallback(toggleExpertMode, [toggleExpertMode]);

  const topBar = (
    <TopBar size="large">
      <div className="title text-white">
        <i className="fa fa-hand-spock-o pr-2" />
        {greeting}, <b>{userProfile?.name}</b>
      </div>
      <div className="info">Select the use case you need to work on from the available actions below.</div>
      <div className="tiles-header-content-wrapper">
        <div className="tiles-header-stack">
          <HeaderTile
            onClick={onServersTileClick}
            icon="fa-server"
            title="1. Create Server"
            text="I want to create a server so that other users (and servers) can access it."
          />
          <HeaderTile
            onClick={onConnectTileClick}
            icon="fa-plug"
            title="2. Connect Me"
            text="I want to have access to the network and its servers."
          />
          <HeaderTile
            onClick={onUsersTileClick}
            icon="fa-users"
            title="3. Invite Users"
            text="I want to add a new user to my network so they can access servers."
          />
          <HeaderTile
            onClick={onHelpTileClick}
            icon="fa-question-circle"
            title="Help & Support"
            text="You can see our user guide, send us feedback, report a bug, etc."
          />
        </div>
      </div>
    </TopBar>
  );

  return (
    <Page windowTitle="Dashboard" className="page-dashboard" topBar={topBar} errors={[meError, dashboardError]}>
      <div className="content-wrapper">
        <TenantBanner company={company} domain={meshUrl} />
        <FeaturedContent me={me} isExpertModeSet={isExpertModeSet} dashboard={dashboard} />
        <div className="flex align-items-center justify-content-center gap-3 mt-5" onClick={onExpertMode}>
          <span>
            {isExpertModeSet
              ? "Turn the expert mode off."
              : "Turn the expert mode on (advanced settings)."}
          </span>
          <InputSwitch checked={isExpertModeSet} />
        </div>
      </div>
    </Page>
  );
}

function TenantBanner({ company, domain }: { company: string; domain: string }) {
  const initials = `${company.charAt(0).toUpperCase()}${company.charAt(1).toUpperCase()}`;
  return (
    <div className="tenant">
      <div>
        <Avatar shape="circle" size="large" label={initials} />
      </div>
      <div>
        <div className="company">{company}</div>
        <div className="domain">{domain}</div>
      </div>
    </div>
  );
}

export default Dashboard;
