import { Button } from "primereact/button";
import { InputSwitch } from "primereact/inputswitch";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { classNames } from "primereact/utils";
import { useEffect, useCallback, useState } from "react";
import { CliApiConfig, CliApiConfigData, useCliApiConfigSaveMutation } from "../../api/generated";
import { RequestError } from "../../api/graphqlBaseQueryTypes";
import SidePanel from "../../components/SidePanel";
import useToast from "../../hooks/useToast";

type CliApiEditProps = {
  visible: boolean;
  config: CliApiConfig | undefined;
  onChange: (config: CliApiConfig | undefined) => void;
  onClose: () => void;
};

function CliApiEdit(props: CliApiEditProps) {
  const [apiActive, setApiActive] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [apiUrl, setApiUrl] = useState<string>("");
  const toast = useToast();
  const [saveCliApi] = useCliApiConfigSaveMutation();

  useEffect(
    () => {
      if (props.config !== undefined) {
        setApiActive(props.config.isEnabled);
        setApiKey(props.config.apiKey);
        setApiUrl(props.config.url);
      } else {
        setApiActive(false);
        setApiKey("");
        setApiUrl("");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.config]
  );

  const onSave = async () => {
    // call grapapi and change attribute
    const config: CliApiConfigData = {
      enabled: !apiActive,
    };
    try {
      const ret = await saveCliApi({
        data: config,
      }).unwrap();
      const retconf = {
        ...props.config!,
        isEnabled: ret.systemCliApiConfigSave.isEnabled,
      };
      setApiActive(ret.systemCliApiConfigSave.isEnabled);
      setApiKey(ret.systemCliApiConfigSave.apiKey);
      setApiUrl(ret.systemCliApiConfigSave.url);
      props.onChange(retconf);
      toast.show({
        severity: "success",
        detail: `Integration API settings has been ${apiActive ? "disabled" : "enabled"}`,
        life: 4000,
      });
  } catch (ex) {
      let e = ex as RequestError;
      let emsg = "An unknown error occurred while saving the system settings";
      if (e.errors.length > 0) {
        emsg = e.errors[0].message;
      }
      toast.show({
        severity: "error",
        detail: emsg,
        life: 4000,
      });
    }
  };
  const onCancel = useCallback(() => {
    props.onClose();
  }, [props]);

  return (
    <SidePanel title="Edit Integration API Settings" onClose={onCancel} visible={props.visible} size="x-small">
      <>
        <div className="side-panel-content side-panel-content-section">
          <h3>
            <i className="fa fa-exclamation-triangle warning" /> Configure integration API, if enabled ApiKey is once
            shown.
          </h3>
          <form>
            <div className="field-checkbox field">
              <div className="field-checkbox-content">
              <label htmlFor="isEnabled">Integration API enabled</label>
                <InputSwitch className="ml-8" checked={apiActive} onChange={onSave} />
              </div>
            </div>
            <div className="field">
              <label htmlFor="apiKey">API Key</label>
              <InputTextarea rows={3} disabled={true} id="apiKey" name="apiKey" value={apiKey} className={classNames("w-full")} />
            </div>
            <div className="field">
              <label htmlFor="apiUrl">API Uri</label>
              <InputText disabled={true} id="apiUri" name="apiUri" value={apiUrl} className={classNames("w-full")} />
            </div>
          </form>
        </div>
        <div className="side-panel-controls">
          <Button label="Cancel" className="p-button-sm p-button-secondary" onClick={onCancel} />
        </div>
      </>
    </SidePanel>
  );
}

export default CliApiEdit;
