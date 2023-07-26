import { AccessDevice } from "../../../../api/generated";
import DateFormat from "../../../../Common/Utils/DateFormat";
import { classNames } from "primereact/utils";

function OSAutoUpdate({ device }: { device?: AccessDevice }) {
  return (
    <div className="install-instructions">
      <div className="install-instructions-header">
        <div className="install-instructions-title">OS update status ({device?.osAutoUpdate?.description})</div>

        <>
            {device?.osAutoUpdate?.lastUpdateSuccess && (
                <>
                    {device?.osAutoUpdate?.otherUpdatesCount === 0 && device?.osAutoUpdate?.securityUpdatesCount === 0 && (
                        <p>
                            <i className="fa fa-check-circle mr-2"></i>
                            Your server operating system is up to date. (Last contact: {DateFormat.toReadableString(device?.osAutoUpdate?.lastUpdate)})
                        </p>
                    )}
                    {!(device?.osAutoUpdate?.otherUpdatesCount === 0 && device?.osAutoUpdate?.securityUpdatesCount === 0) && (
                        <>
                            <p>
                                <i className="fa fa-pause-circle mr-2"></i>
                                Your server operating system needs updates. 
                                Security updates: <b className={classNames({ "security": device?.osAutoUpdate?.securityUpdatesCount !== 0 })}>{device?.osAutoUpdate?.securityUpdatesCount}</b>,
                                Other updates: <b className={classNames({ "security": device?.osAutoUpdate?.otherUpdatesCount !== 0 })}>{device?.osAutoUpdate?.otherUpdatesCount}</b>.
                                
                                (Last contact: {DateFormat.toReadableString(device?.osAutoUpdate?.lastUpdate)})
                            </p>
                            <p>
                                Security updates to install: <b className={classNames({ "security": device?.osAutoUpdate?.securityUpdatesCount !== 0 })}>{device?.osAutoUpdate?.securityUpdatesCount !== 0 ? device?.osAutoUpdate?.securityUpdates.join(", ") : "none"}</b>
                            </p>
                            <p>
                                Other updates to install: <b>{device?.osAutoUpdate?.otherUpdatesCount !== 0 ? device?.osAutoUpdate?.otherUpdates.join(", ") : "none"}</b>
                            </p>
                        </>
                    )}
                </>
            )}

            {!device?.osAutoUpdate?.lastUpdateSuccess && (
                <p>
                    <i className="fa fa-times-circle mr-2 security"></i>
                    Update process failed with error: <b className="security">{device?.osAutoUpdate?.lastUpdateOutput}</b> (Last contact: {DateFormat.toReadableString(device?.osAutoUpdate?.lastUpdate)})
                </p>
            )}
        </>

      </div>
    </div>
  );
}

export default OSAutoUpdate;