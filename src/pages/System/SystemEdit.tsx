import { FormikErrors, useFormik } from "formik";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { classNames } from "primereact/utils";
import { useCallback, useEffect } from "react";
import { SystemConfigData, useSystemConfigSaveMutation } from "../../api/generated";
import { RequestError } from "../../api/graphqlBaseQueryTypes";
import SidePanel from "../../components/SidePanel";
import useToast from "../../hooks/useToast";
import { cannotBeEmpty } from "../../Common/Constants/validationMessages";

type SystemEditProps = {
  visible: boolean;
  config: SystemConfigData | undefined;
  onClose: (config: SystemConfigData | undefined) => void;
};

function SystemEdit(props: SystemEditProps) {
  const toast = useToast();
  const [saveSystemConfig] = useSystemConfigSaveMutation();

  const formik = useFormik({
    initialValues: {
      cidr: "",
    },
    validate: data => {
      let errors: FormikErrors<{ cidr: string; ucidr: string }> = {};

      if (!data.cidr) {
        errors.cidr = cannotBeEmpty;
      } else if (
        !/^((192\.168\.[0-9]{1,3}\.0)|(172\.(1[6-9]|2[0-9]|31)\.[0-9]{1,3}\.0)|(100\.(6[4-9]|[7-9][0-9]|1[0-][0-9]|12[0-7])\.[0-9]{1,3}\.0))(\/(17|18|19|20|21|22|23|24))?$/i.test(
          data.cidr
        )
      ) {
        errors.cidr =
          "Invalid IP address range. The allowed ranges are: 192.168.0.0 - 192.168.254.0 /17-24, 172.16.0.0 - 172.31.0.0 / 17-24, 100.64.0.0 - 100.127.0.0 /17-24.";
      }

      return errors;
    },
    onSubmit: async data => {
      try {
        const ret = await saveSystemConfig({
          data: {
            networkCidr: data.cidr,
          },
        }).unwrap();
        const retconf = {
          ...props.config!,
          networkCidr: ret.systemConfigSave.networkCidr,
        };
        props.onClose(retconf);
        toast.show({
          severity: "success",
          detail: `System settings has been saved successfully`,
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
    },
  });

  useEffect(
    () => {
      if (props.config !== undefined) {
        formik.setValues({ cidr: props.config.networkCidr });
      } else {
        formik.resetForm();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.config]
  );

  const isFieldInvalid = (name: "cidr") => !!(formik.touched[name] && formik.errors[name]);
  const getFormErrorMessage = (name: "cidr") => {
    return isFieldInvalid(name) && <small className="p-error">{formik.errors[name]}</small>;
  };
  const onSave = useCallback(() => formik.submitForm(), [formik]);
  const onCancel = useCallback(() => {
    props.onClose(undefined);
  }, [props]);

  return (
    <SidePanel title="Edit System Settings" onClose={onCancel} visible={props.visible} size="x-small">
      <>
        <div className="side-panel-content side-panel-content-section">
          <h3>
            <i className="fa fa-exclamation-triangle warning" /> Changes in the IP address range will cause all access
            certificates and IP addresses of servers and clients to be regenerated. Do not use this action unless you
            are sure you fully understand its implications.
          </h3>
          <form onSubmit={formik.handleSubmit}>
            <div className="field">
              <label htmlFor="cidr">CIDR</label>
              <InputText
                id="cidr"
                name="cidr"
                value={formik.values.cidr}
                className={classNames("w-full", { "p-invalid": isFieldInvalid("cidr") })}
                onChange={formik.handleChange}
              />
              {getFormErrorMessage("cidr")}
            </div>
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

export default SystemEdit;
