import { Button } from "primereact/button";

import { ClientOs } from "../../../ConnectMeTypes";
import CommandWithClipboard from "../../../../../components/Clipboard/CommandWithClipboard";
import { getClientByOs } from "../../ClientWizardUtils";
import { useMesh } from "../../../../../hooks/useMesh";

function DownloadStep({ setDone }: { setDone: () => void }) {
  const meshUrl = useMesh().url;
  const downloadUrl = getClientByOs(ClientOs.Linux).clientUrl;
  const setupCommand = `wget -qO- "${downloadUrl}" | sudo bash -s -- "$USER" "${meshUrl}"`;
  const appIndicatorCommand = "sudo yum install epel-release && yum install libappindicator-gtk3"

  return (
    <>
      <div className="info">
        Copy the following piece of code and execute it in your terminal. Once you confirm that you agree with the terms
        of use, we will guide you through the installation process.
      </div>
      <div className="info">
        Please, note that the Shieldoo Secure Network service will run as a system service named 'shieldoo-mesh'. The logs will be
        printed to STDOUT where you can access them by the standard Linux management commands.
      </div>
      <CommandWithClipboard value={setupCommand} onChange={setDone} promoteClipboard={true} />
      <div className="info">Because some Linux distributions (especially GNOME) have no direct support for system tray icons, we have to use a few tweaks:</div>
      <ol type="1">
        <li>Install the Tweak application to enable desktop icons (Shieldoo mesh will then appear on the desktop).</li>
        <li>Install the Gnome extension to support systray on Wayland desktop:</li>
        <ol type="a">
          <li>Download App Indicator at <a target="_blank" href="https://extensions.gnome.org/extension/615/appindicator-support/" rel="noopener noreferrer">https://extensions.gnome.org/extension/615/appindicator-support/</a>.</li>
          <li>Activate App Indicator by copying the extracted directory to <i>~/.local/share/gnome-shell/extensions/</i>.</li>
          <li>Install indicator support by running:</li>
          <CommandWithClipboard value={appIndicatorCommand} />
        </ol>
      </ol>
      <Button className="p-button-secondary" label="Next step &rarr;" onClick={setDone} />
    </>
  );
}

export default DownloadStep;
