import { MenuItem } from "primereact/menuitem";
import { TabMenu } from "primereact/tabmenu";
import { useState } from "react";

import InstructionContainer from "./InstructionContainer";
import { getClientByOs, parseFilenameFromUrl } from "../../../ConnectMe/ClientWizard/ClientWizardUtils";
import { ClientOs } from "../../../ConnectMe/ConnectMeTypes";
import CommandWithClipboard from "../../../../components/Clipboard/CommandWithClipboard";

function WindowsInstruction({ accessConfig }: { accessConfig: string }) {
  const downloadUrl = getClientByOs(ClientOs.Windows).serverUrl;
  const filename = parseFilenameFromUrl(downloadUrl);

  const [tab, setTab] = useState("graphical");
  const tabItems: MenuItem[] = [
    {
      label: "Graphical installation",
      command: () => setTab("graphical"),
    },
    {
      label: "Command line",
      command: () => setTab("cmd"),
    },
  ];

  return (
    <InstructionContainer>
      <p>
        Shieldoo Secure Network service will run as a system service named 'shieldoo-mesh' and its logs will be stored
        in the Windows event log.
      </p>
      <p>
          2. Download the installer:{" "}
          <a target="_new" href={downloadUrl}>
            {filename}
          </a>
      </p>
      <TabMenu model={tabItems} />
      <TabContent tab={tab} filename={filename} accessConfig={accessConfig} />
    </InstructionContainer>
  );
}

function TabContent({ tab, filename, accessConfig }: { tab: string; filename: string; accessConfig: string }) {
  switch (tab) {
    case "graphical":
      return (
        <>
          <p>3. Run the installer and in the second wizard screen, provide the following configuration data:</p>
          <CommandWithClipboard classNames="clipboard" value={accessConfig} />
        </>
      );
    case "cmd":
      return (
        <>
          <p>3. Run the installer  with the following command:</p>
          <CommandWithClipboard classNames="clipboard" value={`${filename} /S /DATA="${accessConfig}"`} />
        </>
      );
    default:
      return <></>;
  }
}

export default WindowsInstruction;
