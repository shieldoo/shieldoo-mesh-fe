import { FormikErrors, useFormik } from "formik";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { InputText } from "primereact/inputtext";
import { classNames } from "primereact/utils";
import { useEffect, useCallback, useState } from "react";
import { AadConfigData, useAadConfigSaveMutation } from "../../api/generated";
import { RequestError } from "../../api/graphqlBaseQueryTypes";
import SidePanel from "../../components/SidePanel";
import useToast from "../../hooks/useToast";

type IdentityEditProps = {
  visible: boolean;
  config: AadConfigData | undefined;
  logMessage: string;
  onClose: (config: AadConfigData | undefined) => void;
};

function IdentityEdit(props: IdentityEditProps) {
  const [identityActive, setIdentityActive] = useState<boolean>(false);
  const [logMessage, setLogMessage] = useState<string>("");
  const toast = useToast();
  const [saveIdentityConfig] = useAadConfigSaveMutation();

  const clientSecret = useCallback(() => {
    if (props.config?.clientSecret) {
      return "(" + props.config?.clientSecret + ")";
    } else {
      return "";
    }
  }, [props.config?.clientSecret]);

  const validateGuid = useCallback((value: string) => {
    if (!value) {
      return "Cannot be empty";
    } else if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value)) {
      return "Invalid format";
    }
    return "";
  }, []);

  const formik = useFormik({
    initialValues: {
      isEnabled: false,
      adminGroupObjectId: "",
      clientId: "",
      clientSecret: "",
      tenantId: "",
    },
    validate: data => {
      let errors: FormikErrors<{
        adminGroupObjectId: string;
        clientId: string;
        clientSecret: string;
        tenantId: string;
      }> = {};
      setIdentityActive(data.isEnabled);
      if (data.isEnabled) {
        if (validateGuid(data.adminGroupObjectId) !== "") {
          errors.adminGroupObjectId = validateGuid(data.adminGroupObjectId);
        }
        if (validateGuid(data.clientId) !== "") {
          errors.clientId = validateGuid(data.clientId);
        }
        if (validateGuid(data.tenantId) !== "") {
          errors.tenantId = validateGuid(data.tenantId);
        }
      }
      return errors;
    },
    onSubmit: async data => {
      try {
        const ret = await saveIdentityConfig({
          data: {
            isEnabled: data.isEnabled,
            adminGroupObjectId: data.adminGroupObjectId,
            clientId: data.clientId,
            clientSecret: data.clientSecret,
            tenantId: data.tenantId,
          },
        }).unwrap();
        const retconf = {
          ...props.config!,
        };
        // if response starts with OK, then it is a success
        setLogMessage(ret.systemAadConfigSave.lastProcessingMessage);
        if (ret.systemAadConfigSave.lastProcessingMessage.startsWith("OK:")) {
          props.onClose(retconf);
          toast.show({
            severity: "success",
            detail: `System settings has been saved successfully`,
            life: 4000,
          });
        } else {
          toast.show({
            severity: "error",
            detail: `Error saving system configuration. See message below.`,
            life: 4000,
          });
        }
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
    },
  });

  useEffect(
    () => {
      if (props.config !== undefined) {
        formik.setValues({
          isEnabled: props.config!.isEnabled,
          adminGroupObjectId: props.config!.adminGroupObjectId,
          clientId: props.config!.clientId,
          clientSecret: "",
          tenantId: props.config!.tenantId,
        });
        setLogMessage(props.logMessage);
      } else {
        formik.resetForm();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.config, props.logMessage]
  );

  const isFieldInvalid = (name: "tenantId" | "clientId" | "clientSecret" | "adminGroupObjectId") =>
    !!(formik.touched[name] && formik.errors[name]);
  const getFormErrorMessage = (name: "tenantId" | "clientId" | "clientSecret" | "adminGroupObjectId") => {
    return isFieldInvalid(name) && <small className="p-error">{formik.errors[name]}</small>;
  };

  const onSave = useCallback(() => formik.submitForm(), [formik]);
  const onCancel = useCallback(() => {
    props.onClose(undefined);
  }, [props]);

  return (
    <SidePanel title="Edit Identity Settings" onClose={onCancel} visible={props.visible} size="x-small">
      <>
        <div className="side-panel-content side-panel-content-section">
          <h3>
            <i className="fa fa-exclamation-triangle warning" /> Configure attributes of your Azure AD application
            defined in your Azure AD tenant. Your application needs these application permissions: User.Read.All,
            Group.Read.All, GroupMember.Read.All.
          </h3>
          <ul>
            <li>Import will load (create) all AAD Shieldoo admin group members configured below and give ADMIN rights in shieldoo to them.</li>
            <li>Then it will load (create) all AAD group members used in firewall configurations.</li>
            <li>Users who do not belong to Shieldoo admin group or any group used in firewall configurations are deleted.</li>
            <li>Import always loads all AAD groups to shieldoo, and then you can use them for configurations.</li>
            <li>The import runs every 20 minutes and immediately after saving.</li>
          </ul>
          <form onSubmit={formik.handleSubmit}>
            <div className="field-checkbox field">
              <div className="field-checkbox-content">
                <Checkbox
                  id="isEnabled"
                  name="isEnabled"
                  checked={formik.values.isEnabled}
                  onChange={formik.handleChange}
                />
                <label htmlFor="isEnabled" className={classNames({"labelBold": identityActive})}>Azure AD import enabled</label>
              </div>
            </div>
            <div className="field">
              <label htmlFor="tenantId">Tenant Id</label>
              <InputText
                disabled={!identityActive}
                id="tenantId"
                name="tenantId"
                value={formik.values.tenantId}
                className={classNames("w-full", { "p-invalid": isFieldInvalid("tenantId") })}
                onChange={formik.handleChange}
              />
              {getFormErrorMessage("tenantId")}
            </div>
            <div className="field">
              <label htmlFor="clientId">Client Id</label>
              <InputText
                disabled={!identityActive}
                id="clientId"
                name="clientId"
                value={formik.values.clientId}
                className={classNames("w-full", { "p-invalid": isFieldInvalid("clientId") })}
                onChange={formik.handleChange}
              />
              {getFormErrorMessage("clientId")}
            </div>
            <div className="field">
              <label htmlFor="clientSecret">Client secret {clientSecret()}</label>
              <InputText
                disabled={!identityActive}
                id="clientSecret"
                name="clientSecret"
                value={formik.values.clientSecret}
                className={classNames("w-full", { "p-invalid": isFieldInvalid("clientSecret") })}
                onChange={formik.handleChange}
                placeholder={
                  clientSecret() !== ""
                    ? "Enter client secret if you want to change current one"
                    : "Enter client secret"
                }
              />
              {getFormErrorMessage("clientSecret")}
            </div>
            <div className="field">
              <label htmlFor="adminGroupObjectId">Shieldoo admin group ObjectId</label>
              <InputText
                disabled={!identityActive}
                id="adminGroupObjectId"
                name="adminGroupObjectId"
                value={formik.values.adminGroupObjectId}
                className={classNames("w-full", { "p-invalid": isFieldInvalid("adminGroupObjectId") })}
                onChange={formik.handleChange}
              />
              {getFormErrorMessage("adminGroupObjectId")}
            </div>
            <h3>Message:</h3>
            <div>{logMessage}</div>
          </form>
        </div>
        <div className="side-panel-controls">
          <Button label="Save" className="p-button-sm" onClick={onSave} icon="fa-regular fa-save" />
          <Button label="Cancel" className="p-button-sm p-button-secondary" onClick={onCancel} />
        </div>
      </>
    </SidePanel>
  );
}

export default IdentityEdit;
