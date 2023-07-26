import { Button } from "primereact/button";

import InputWithClipboard from "../../../../../components/Clipboard/InputWithClipboard";
import { useMesh } from "../../../../../hooks/useMesh";

function ConfigureStep({ setDone }: { setDone: () => void }) {
  const meshUrl = useMesh().url;

  return (
    <>
      <div className="info">
        Run the downloaded installer; once you confirm that you agree with the terms of use, you will need to
        insert the following parameter into the installer to tell the Shieldoo client where to connect:
      </div>
      <InputWithClipboard value={meshUrl} onChange={setDone} promoteClipboard={true} />
      <div className="info">
        After installation run Shieldoo App from Launcher. Once the application is launched, the Shieldoo client icon will appear in the menu bar <img alt="" height="16px" src="../img/connect-me-macos-02.png" />.
        This means you are not yet signed in or connected.
      </div>
      <img src="../img/connect-me-macos-01.png" alt="" />
      <div className="info">
        Right-click on the Shieldoo icon and select 'Sign-in to Shieldoo' to sign in with your credentials. The icon
        should turn into <img height="16px" src="../img/connect-me-macos-03.png" alt="" />. That indicates you have successfully signed in but are not yet connected.
      </div>
      <Button className="p-button-secondary" label="Next step &rarr;" onClick={setDone} />
    </>
  );
}

export default ConfigureStep;
