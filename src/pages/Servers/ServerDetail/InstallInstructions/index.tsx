import { MenuItem } from "primereact/menuitem";
import { TabMenu } from "primereact/tabmenu";
import { useState } from "react";
import { useParams } from "react-router-dom";

import WindowsInstruction from "./WindowsInstruction";
import LinuxInstruction from "./LinuxInstruction";
import { useServerAccessQuery } from "../../../../api/generated";
import MacOSInstruction from "./MacOSInstruction";

function InstallInstructions({ deviceOs }: { deviceOs?: string }) {
  const params = useParams<{ id: string }>();

  const [selectedOs, setSelectedOs] = useState(deviceOs && deviceOs !== "unknown" ? deviceOs : "windows");
  const tabItems: MenuItem[] = [
    {
      label: "Windows",
      icon: <i className="fa fa-windows mr-2"></i>,
      command: () => setSelectedOs("windows"),
    },
    {
      label: "Linux",
      icon: <i className="fa fa-linux mr-2"></i>,
      command: () => setSelectedOs("linux"),
    },
    {
      label: "macOS",
      icon: <i className="fa fa-apple mr-2"></i>,
      command: () => setSelectedOs("macos"),
    },
  ];

  const { data } = useServerAccessQuery({ id: parseInt(params.id!) });
  const accessConfig = data?.server.access.config || "";

  return (
    <div className="install-instructions">
      <div className="install-instructions-header">
        <div className="install-instructions-title">Installation Instructions</div>
        <p>
          The server side application is a solution for servers in your organization. It contains one executable file
          which is a system service responsible for connection management and communication.
        </p>
        <p>
          The installation requires the necessary CONFIGURATION DATA. That data is available in the detail of each
          server instance on the web management portal. The configuration data is a file encoded in Base64, containing
          a unique access token for the server. Therefore, <b className="security">it has to be secured as a sensitive
          data asset</b>.

        </p>
        <p>
          1. Select the operating system you want to install the Shieldoo client on.
        </p>
      </div>
      <div className="content-tabs">
        <TabMenu model={tabItems} />
      </div>
      <div className="install-instructions-content">
        <Instruction os={selectedOs} accessConfig={accessConfig} />
      </div>
    </div>
  );
}

function Instruction({ os, accessConfig }: { os: string | undefined; accessConfig: string }) {
  switch (os) {
    case "windows":
      return <WindowsInstruction accessConfig={accessConfig} />;
    case "linux":
      return <LinuxInstruction accessConfig={accessConfig} />;
    case "macos":
      return <MacOSInstruction accessConfig={accessConfig} />;
    default:
      return <></>;
  }
}
export default InstallInstructions;
