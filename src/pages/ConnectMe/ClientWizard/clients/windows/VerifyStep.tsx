import { useSelector } from "react-redux";

import { selectors } from "../../../../../ducks/auth";
import ConnectionWatcher from "../../components/ConnectionWatcher";

function VerifyStep({ setDone }: { setDone: () => void }) {
  const config = useSelector(selectors.selectUiConfig);
  const tenantName = config?.tenantName || "Shieldoo";

  return (
    <>
      <div className="info">
        Almost done! The last and most important step is to connect your device with the {tenantName} network.
        In the system tray, right-click on the Shieldoo icon and select 'Connect'. The icon should
        turn into <img alt="" height="16px" src="../img/connect-me-win-04.png" />, indicating that the device is now connected.
      </div>
      <ConnectionWatcher tenantName={tenantName} onChange={setDone} />
      <div className="info">
        To disconnect from the {tenantName} network, repeat this step but select 'Disconnect'.
        The icon should turn into <img alt="" height="16px" src="../img/connect-me-win-03.png" />, indicating that you are
        still signed in but no longer connected.
      </div>
    </>
  );
}

export default VerifyStep;
