import { Tag } from "primereact/tag";

import { Server } from "../../api/generated";
import DateFormat from "../../Common/Utils/DateFormat";

function ServerStatusTag({ server }: { server: Server }) {
  const lastContactFromNow =
    server?.access?.statistics?.lastContactFromNow === undefined || server?.access?.statistics?.lastContactFromNow === null
      ? 1000
      : server?.access?.statistics?.lastContactFromNow;
  const colorSeverity =
    server?.access?.statistics?.isConnectd === undefined || server?.access?.statistics?.isConnectd === null
      ? "danger"
      : server?.access?.statistics?.isConnectd && lastContactFromNow < 120
      ? "success"
      : "warning";
  const isConnectedIcon = (() => {
    switch (colorSeverity) {
      case "danger":
        return "fa fa-regular fa-exclamation-circle";
      case "warning":
        return "fa fa-regular fa-warning";
      default:
        return server?.access?.statistics?.isOverRestrictiveNetwork
          ? "fa fa-regular fa-exclamation-triangle"
          : "fa fa-regular fa-wifi";
    }
  })();
  const isConnectedText =
    server?.access?.statistics?.isConnectd === undefined || server?.access?.statistics?.isConnectd === null
      ? "Never connected"
      : lastContactFromNow < 120
      ? server?.access?.statistics?.isConnectd
        ? "Connected"
        : "Network connection problem"
      : "Last seen: " + DateFormat.toReadableString(server?.access?.statistics?.lastContact);

  return <Tag icon={isConnectedIcon} severity={colorSeverity} value={isConnectedText} />;
}

export default ServerStatusTag;
