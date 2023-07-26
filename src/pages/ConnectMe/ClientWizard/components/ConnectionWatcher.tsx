import { classNames } from "primereact/utils";
import { useEffect, useState } from "react";
import { useInterval } from "usehooks-ts";

import { useMeQuery } from "../../../../api/generated";
import Loader from "../../../../components/Loader";

type Props = {
  tenantName: string;
  onChange: () => void;
};
function ConnectionWatcher(props: Props) {
  const { data, refetch } = useMeQuery({});

  const checkInterval = 3000;
  const userDevices = data?.me.userAccesses[0].accesses;
  const [clientConnected, setClientConnected] = useState(false);

  useInterval(refetch, clientConnected ? null : checkInterval);

  useEffect(() => {
    if (userDevices && userDevices?.length > 0) {
      setClientConnected(true);
      props.onChange();
    }
  }, [props, userDevices]);

  return (
    <div
      className={classNames("client-watcher", {
        "client-watcher-connected": clientConnected,
        "client-watcher-waiting": !clientConnected,
      })}
    >
      {clientConnected ? <ConnectionSuccess tenantName={props.tenantName} /> : <WaitingForConnection />}
    </div>
  );
}

function WaitingForConnection() {
  return (
    <>
      <Loader size={"2x"} />
      <span>Waiting for connection...</span>
    </>
  );
}
function ConnectionSuccess({ tenantName }: { tenantName: string }) {
  return (
    <>
      <i
        className={classNames("fa fa-2x fa-check-circle icon fa-duotone", {
          "state-completed": true,
        })}
      />
      Well done! Your device is now connected to the {tenantName} network.
    </>
  );
}

export default ConnectionWatcher;
