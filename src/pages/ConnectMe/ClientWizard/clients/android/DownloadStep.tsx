import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { useEffect, useState } from "react";
import { useMeQuery } from "../../../../../api/generated";
import { ClientOs } from "../../../ConnectMeTypes";
import { getClientByOs } from "../../ClientWizardUtils";

type OptionForUserAccess = {
  id: number;
  label: string;
};

function DownloadStep({ setDone }: { setDone: (userAccessId: number, pem: string) => void }) {
  const downloadUrl = getClientByOs(ClientOs.Android).clientUrl;
  const [edPEM, setEdPEM] = useState<string>("");
  const [edUAID, setEdUAID] = useState<number>(0);
  const [optionsUA, setOptionsUA] = useState<OptionForUserAccess[] | undefined>(undefined);
  const { data: meData } = useMeQuery({});

  const onClickPem = () => {
    setDone(edUAID, edPEM);
  };

  useEffect(() => {
    if (meData?.me?.userAccesses) {
      const options = meData.me.userAccesses.map(ua => {
        return {
          id: ua.id,
          label: ua.name,
        };
      });
      setOptionsUA(options);
      if (options.length > 0) {
        setEdUAID(options[0].id);
      }
    }
  }, [meData]);

  return (
    <>
      <div className="info">
        Please download and install the nebula client on your Android device. &nbsp;
        <a target="_blank" rel="noreferrer" href={downloadUrl}>
          <img
            src="../img/connect-me-android-download.png"
            alt="Download from Google Play"
            width="150px"
            style={{ verticalAlign: "middle" }}
          ></img>
        </a>
      </div>
      <div className="info">
        After installation open application <strong>Nebula</strong> and create an new site configuration (use{" "}
        <strong>+</strong> button).
      </div>
      <div className="info">
        In the configuration screen enter the name of your profile{" "}
        <span style={{ fontSize: "1.8rem", fontWeight: "900" }}>①</span> and click on <strong>Certificate</strong>.
        <div>
          <img alt="screen1" src="../img/connect-me-ios-01.png" width="100%" style={{ maxWidth: "200px" }}></img>
        </div>
      </div>
      <div className="info">
        In the certificate screen nebula will create private key on your device and generate a public key which is shown
        on display <span style={{ fontSize: "1.8rem", fontWeight: "900" }}>①</span>. Please copy the public key and
        paste it into the text box below, select your access profile and press continue.
        <div>
          <img alt="screen1" src="../img/connect-me-ios-02.png" width="100%" style={{ maxWidth: "200px" }}></img>
        </div>
      </div>
      <div className="field">
        Your access profile:{" "}
        <Dropdown
          className="p-dropdown-sm w-full"
          id="uaid"
          name="uaid"
          value={edUAID}
          placeholder="Select profile"
          options={optionsUA}
          optionLabel="label"
          optionValue="id"
          onChange={e => setEdUAID(e.value)}
        />
      </div>
      <div className="info">
        <InputTextarea
          placeholder="Paste your public key here"
          className="w-full"
          rows={5}
          style={{ width: "100%" }}
          onChange={e => {
            setEdPEM(e.target.value);
          }}
        />
        <Button
          disabled={edPEM.length < 10 || edUAID < 1}
          label="Continue"
          className="p-button-sm p-button-primary"
          onClick={onClickPem}
        />
      </div>
    </>
  );
}

export default DownloadStep;
