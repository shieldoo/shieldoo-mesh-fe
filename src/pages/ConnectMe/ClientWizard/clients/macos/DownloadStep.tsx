import { Button } from "primereact/button";
import { classNames } from "primereact/utils";
import { useRef, useState } from "react";

import { ClientOs } from "../../../ConnectMeTypes";
import { getClientByOs } from "../../ClientWizardUtils";

function DownloadStep({ setDone }: { setDone: () => void }) {
  const [promoteDownload, setPromoteDownload] = useState(true);
  const buttonRef = useRef<any>();
  const client = getClientByOs(ClientOs.MacOS);

  return (
    <>
      <div className="info">Click on the download button to get the client and to unlock the next step.</div>
      <a
        aria-label="Download"
        className="a-button"
        href={client.clientUrl}
        target="_blank"
        rel="noopener noreferrer"
        download
      >
        <Button
          ref={buttonRef}
          className="p-button-secondary"
          icon={<i className={classNames({ "p-button-icon fa fa-beat fa-download": promoteDownload })} />}
          label={`Download${client.downloadSize ? ` (${client.downloadSize})` : ""}`}
          onClick={() => {
            buttonRef.current.blur();
            setPromoteDownload(false);
            setDone();
          }}
        />
      </a>
    </>
  );
}

export default DownloadStep;
