import { MenuItem } from "primereact/menuitem";
import { TabMenu } from "primereact/tabmenu";
import { useState } from "react";

import InstructionContainer from "./InstructionContainer";
import { getClientByOs, parseFilenameFromUrl } from "../../../ConnectMe/ClientWizard/ClientWizardUtils";
import { ClientOs } from "../../../ConnectMe/ConnectMeTypes";
import CommandWithClipboard from "../../../../components/Clipboard/CommandWithClipboard";

function MacOSInstruction({ accessConfig }: { accessConfig: string }) {
  const downloadUrl = getClientByOs(ClientOs.MacOS).serverUrl;
  const filename = parseFilenameFromUrl(downloadUrl);

  const [tab, setTab] = useState("graphical");
  const tabItems: MenuItem[] = [
    {
      label: "Graphical installation",
      command: () => setTab("graphical"),
    },
  ];

  return (
    <InstructionContainer>
      <p>
        Shieldoo Secure Network service will run like a system service named <i>shieldoo-mesh</i> and logs will be stored in
        launchd.
      </p>
      <p>
        <li>
          Download installer{" "}
          <a target="_new" href={downloadUrl}>
            {filename}
          </a>
        </li>
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
          <p>Run the installer and in the wizards' input message box provide the configuration data below:</p>
          <CommandWithClipboard classNames="clipboard" value={accessConfig} />
        </>
      );
    default:
      return <></>;
  }
}

export default MacOSInstruction;
