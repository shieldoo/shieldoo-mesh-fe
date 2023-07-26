import { Avatar } from "primereact/avatar";
import { Tag } from "primereact/tag";
import { useNavigate } from "react-router-dom";

import { AppRoute } from "../../../AppRoute";
import { wrapLinks } from "../../../Common/Utils/ParseUtils";
import TopBar from "../../../components/TopBar";
import ServerStatusTag from "../../../components/ServerStatusTag";
import { Server } from "../../../api/generated";

type CustomBarProps = {
  onEdit: () => void;
  onDelete: () => void;
  server: Server;
  serverNotFound: boolean;
  serverStats: {
    connected: boolean | null | undefined;
    lastSeen: number;
    lastSeenDate: Date;
    serverOS: string;
    serverSWVersion: string;
    serverOSType: string;
  };
};

function CustomBar(props: CustomBarProps) {
  const navigate = useNavigate();
  const navigationItemsPage = [
    {
      label: "Edit",
      icon: "fa-regular fa-pencil",
      command: () => props.onEdit(),
    },
    {
      label: "Delete",
      icon: "fa-regular fa-trash",
      command: () => props.onDelete(),
    },
  ];
  const navigationBack = [
    {
      label: "Back to servers",
      icon: "fa-regular fa-long-arrow-left",
      command: () => navigate(AppRoute.Servers),
    },
  ];

  const filterPageItems = () => {
    if (props.serverNotFound) {
      return [];
    }
    return navigationItemsPage;
  };

  const navigationItems = [...navigationBack, ...filterPageItems()];

  const srvOSIcon = () => {
    switch (props.serverStats.serverOSType) {
      case "windows":
        return "fa fa-windows";
      case "linux":
        return "fa fa-linux";
      case "darwin":
        return "fa fa-apple";
      default:
        return "fa-regular fa-question";
    }
  };

  return (
    <TopBar hideUserMenu size={props.serverNotFound ? "small" : "medium"} navigationItems={navigationItems}>
      <div className="flex">
        <Avatar shape="circle" className="server-avatar" size="xlarge" icon={srvOSIcon()} />
        <div className="ml-4">
          <div className="toolbar-text-large">
            <span>{props.server?.name}</span>
            <Tag severity="none" value={"version: " + props.serverStats.serverSWVersion} />
            <ServerStatusTag server={props.server} />
          </div>
          <div className="toolbar-text-normal">{wrapLinks(props.server?.description || "", "highlight")} | OS info: {props.serverStats.serverOS}</div>
        </div>
      </div>
    </TopBar>
  );
}

export default CustomBar;
