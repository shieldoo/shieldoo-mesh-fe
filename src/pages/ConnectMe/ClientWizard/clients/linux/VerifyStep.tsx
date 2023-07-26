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
      </div>
      <ConnectionWatcher tenantName={tenantName} onChange={setDone} />
    </>
  );
}

export default VerifyStep;
