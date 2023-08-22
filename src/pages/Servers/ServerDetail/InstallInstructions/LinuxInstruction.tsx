import { useState } from "react";
import { TabMenu } from "primereact/tabmenu";
import { MenuItem } from "primereact/menuitem";

import { getClientByOs, parseFilenameFromUrl } from "../../../ConnectMe/ClientWizard/ClientWizardUtils";
import { ClientOs } from "../../../ConnectMe/ConnectMeTypes";
import InstructionContainer from "./InstructionContainer";
import CommandWithClipboard from "../../../../components/Clipboard/CommandWithClipboard";

function LinuxInstruction({ accessConfig }: { accessConfig: string }) {
  const [tab, setTab] = useState("graphical");
  const tabItems: MenuItem[] = [
    {
      label: "Quick setup - Linux 64bit (amd64)",
      command: () => setTab("graphical"),
    },
    {
      label: "Manual (amd64)",
      command: () => setTab("cmd"),
    },
    {
      label: "Raspberry Pi (arm7)",
      command: () => setTab("arm7"),
    },
  ];

  return (
    <InstructionContainer>
      <p>
        The Shieldoo Secure Network service will run as a system service named 'shieldoo-mesh'. Its logs will be printed to STDOUT
        where you can access them by the standard Linux management commands.
      </p>
      <TabMenu model={tabItems} />
      <TabContent tab={tab} accessConfig={accessConfig} />
    </InstructionContainer>
  );
}

function TabContent({ tab, accessConfig }: { tab: string; accessConfig: string }) {
  const downloadUrl = getClientByOs(ClientOs.Linux).serverUrl;
  const filename = parseFilenameFromUrl(downloadUrl);

  const quickSetupCommand = `wget -qO- "${
    getClientByOs(ClientOs.Linux).serverScriptUrl
  }" | sudo bash -s -- "${accessConfig}"`;

  const quickSetupCommandArm7 = `wget -qO- "${
    getClientByOs(ClientOs.Raspberry).serverScriptUrl
  }" | sudo bash -s -- "${accessConfig}"`;

  const manualSetupCommand = `# All commands are executed as root.
# This is reason why we use sudo for all commands.
  
# Stop mesh if it is already running.
sudo /opt/shieldoo-mesh/shieldoo-mesh-srv -service stop
    
# Create a directory if not exists.
sudo mkdir -p /opt/shieldoo-mesh
    
# Install the application.
cat ./${filename} | sudo tar -xvz -C /opt/shieldoo-mesh
sudo chmod 755 /opt/shieldoo-mesh/shieldoo-mesh-srv
sudo chown root:root /opt/shieldoo-mesh/shieldoo-mesh-srv
    
# Create a configuration file from the configuration data.
sudo /opt/shieldoo-mesh/shieldoo-mesh-srv -createconfig "${accessConfig}"

# Install the system service.install service
sudo /opt/shieldoo-mesh/shieldoo-mesh-srv -service install
sudo /opt/shieldoo-mesh/shieldoo-mesh-srv -service start`;

  switch (tab) {
    case "graphical":
      return (
        <>
          <p>2. Open your servers' command line and run the following command:</p>
          <CommandWithClipboard classNames="clipboard" value={quickSetupCommand} />
        </>
      );
      case "arm7":
        return (
          <>
            <p>2. Open your servers' command line and run the following command:</p>
            <CommandWithClipboard classNames="clipboard" value={quickSetupCommandArm7} />
          </>
        );
      case "cmd":
      return (
        <>
          <p>
            2. Download the installation package {" "}
            <a target="_new" href={downloadUrl}>{filename}</a>
            {" "} and go through the following installation steps (assuming that the target directory will be{" "}
            <i>/opt/shieldoo-mesh</i>):
          </p>
          <CommandWithClipboard value={manualSetupCommand} />
        </>
      );
    default:
      return <></>;
  }
}

export default LinuxInstruction;
