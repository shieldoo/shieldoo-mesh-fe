import { useCallback } from "react";
import { Button } from "primereact/button";
import { generatePath, useNavigate } from "react-router-dom";

import { UserStatistic, MeQuery, AdminDashboardQuery } from "../../api/generated";
import { AppRoute } from "../../AppRoute";
import useAppNavigate from "../../hooks/useAppNavigate";
import CounterTile from "./components/CounterTile";
import StatsTile from "./components/StatsTile";
import EmptyContent from "../../components/EmptyContent";

function FeaturedContent({ me, dashboard, isExpertModeSet }: {
  me?: MeQuery,
  dashboard?: AdminDashboardQuery,
  isExpertModeSet: boolean,
}) {
  const reactNavigate = useNavigate();
  const navigate = useAppNavigate();
  const devicesCount =
    me?.me.userAccesses
      .map(e => e.accesses.filter(a => a.deviceInfo?.deviceId !== "").length)
      .reduce(function (count, e) {
        return count + e;
      }, 0) || 0;

  const serverCount = dashboard?.adminDashboard.servers || 0;
  const userCount = dashboard?.adminDashboard.users || 0;

  const onConnectTileClick = useCallback(() => {
    navigate(AppRoute.ConnectMe);
  }, [navigate]);
  const onDevicesTileClick = useCallback(() => {
    navigate(AppRoute.Devices);
  }, [navigate]);
  const onServersTileClick = useCallback(() => {
    navigate(AppRoute.Servers);
  }, [navigate]);
  const onUsersTileClick = useCallback(() => {
    navigate(AppRoute.Users);
  }, [navigate]);
  const onInvitedUsersTileClick = useCallback(() => {
    reactNavigate(generatePath(AppRoute.UsersInvited, { invited: "true" }));
  }, [reactNavigate]);

  if (!isExpertModeSet && serverCount < 1) {
    return (
      <div>
        <EmptyContent
          title={<span>Create your first server<br /> to get secure remote access</span>}
          text=""
          isDashboard
          iconClass="fa-regular fa-eye fa-10x"
          customContent={<Button label="Create a server" className="p-button-sm" icon="fa-regular fa-plus" onClick={onServersTileClick} />}
        />
      </div>
    );
  }

  if (!isExpertModeSet && devicesCount < 1) {
    return (
      <div>
        <EmptyContent
          title={<span>Connect your computer<br /> to get secure remote access</span>}
          text=""
          iconClass="fa-regular fa-eye fa-10x"
          isDashboard
          customContent={
            <Button label="Connect me" className="p-button-sm" icon="fa-regular fa-plus" onClick={onConnectTileClick} />}
        />
      </div>
    );
  }

  if (!isExpertModeSet && userCount < 2) {
    return (
      <div>
        <EmptyContent
          title={<span>Invite your coworkers<br /> to let them access your servers securely</span>}
          text=""
          isDashboard
          iconClass="fa-regular fa-eye fa-10x"
          customContent={<Button label="Invite a user" className="p-button-sm" icon="fa-regular fa-plus" onClick={onUsersTileClick} />}
        />
      </div>
    );
  }
  const invitationsCount = dashboard?.adminDashboard.invitedUsers || 0;
  const connectionStatistics = (dashboard?.adminDashboard.userStatistics || []) as UserStatistic[];



  return ((<div className="tiles">
    <div className="tiles-stack">
      <CounterTile title="Users" count={userCount} onClick={onUsersTileClick} />
      <CounterTile title="Servers" count={serverCount} onClick={onServersTileClick} />
      <CounterTile
        title="Pending invitations"
        count={invitationsCount}
        hasWarning={invitationsCount > 0}
        onClick={onInvitedUsersTileClick}
      />
      <CounterTile title="My devices" count={devicesCount} onClick={onDevicesTileClick} />
    </div>
    <StatsTile stats={connectionStatistics} />
  </div>))
}

export default FeaturedContent;
