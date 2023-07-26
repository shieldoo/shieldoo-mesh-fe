import { UserDeviceCreateMutation } from "../../../../../api/generated";
import ButtonWithClipboard from "../../../../../components/Clipboard/ButtonWithClipboard";
import CommandWithClipboard from "../../../../../components/Clipboard/CommandWithClipboard";

type UserAccessDeviceInfo = UserDeviceCreateMutation["userDeviceCreate"];

function ConfigureStep({ setDone, data }: { setDone: () => void; data: UserAccessDeviceInfo | undefined }) {
  return (
    <>
      <div className="info">
        Now you can copy certificate PEM content to your nebula client in device{" "}
        <span style={{ fontSize: "1.8rem", fontWeight: "900" }}>②</span> and load certificate:
        <CommandWithClipboard classNames="scalled-element" value={data?.certificate || ""} />
      </div>
      <div>
        <img alt="screen1" src="../img/connect-me-ios-02a.png" width="100%" style={{ maxWidth: "200px" }}></img>
      </div>{" "}
      <div className="info">
        In the configuration screen go to <strong>CA</strong> section{" "}
        <span style={{ fontSize: "1.8rem", fontWeight: "900" }}>①</span> and paste CA certificate content from below and
        load CA certificate:
        <CommandWithClipboard classNames="scalled-element" value={data?.caPublicKey || ""} />
      </div>
      <div>
        <img alt="screen1" src="../img/connect-me-ios-03.png" width="100%" style={{ maxWidth: "200px" }}></img>
      </div>
      <div className="info">
        Go to section <strong>Hosts</strong> and create new host entry with following attributes and save:
        <table>
          <tbody>
            <tr>
              <td>
                <span style={{ fontSize: "1.8rem", fontWeight: "900" }}>①</span> Nebula IP:
              </td>
              <td>{data?.lighthousePrivateIp}</td>
              <td>
                <ButtonWithClipboard value={data?.lighthousePrivateIp || ""} />
              </td>
            </tr>
            <tr>
              <td>
                <span style={{ fontSize: "1.8rem", fontWeight: "900" }}>②</span> Lighthouse:
              </td>
              <td>Switch on!</td>
            </tr>
            <td></td>
            <tr>
              <td>
                <span style={{ fontSize: "1.8rem", fontWeight: "900" }}>③</span> Public IP:
              </td>
              <td>{data?.lighthouseIp}</td>
              <td>
                <ButtonWithClipboard value={data?.lighthouseIp || ""} />
              </td>
            </tr>
            <tr>
              <td>
                <span style={{ fontSize: "1.8rem", fontWeight: "900" }}>④</span> Port:
              </td>
              <td>{data?.lighthousePort}</td>
              <td>
                <ButtonWithClipboard value={(data?.lighthousePort || 0) + ""} />
              </td>
            </tr>
          </tbody>
        </table>
        <div>
          <img alt="screen1" src="../img/connect-me-ios-04.png" width="100%" style={{ maxWidth: "200px" }}></img>
        </div>
      </div>
      <div className="info">Now you are done, enjoy your private network! </div>
    </>
  );
}

export default ConfigureStep;
