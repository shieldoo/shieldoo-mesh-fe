import { FormikErrors, useFormik } from "formik";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { classNames } from "primereact/utils";
import { useCallback, useEffect, useState } from "react";
import { useCodeListUserAccessTemplatesQuery, useConfigQuery, useLazyUserAccessTemplateQuery, UserAccessTemplateQuery, useUserAccessSaveMutation } from "../../../api/generated";
import { RequestError } from "../../../api/graphqlBaseQueryTypes";
import SidePanel from "../../../components/SidePanel";
import useToast from "../../../hooks/useToast";
import AccessInputs, { AccessAttributes } from "../../../components/AccessInputs";
import DateFormat from "../../../Common/Utils/DateFormat";
import { cannotBeEmpty } from "../../../Common/Constants/validationMessages";

type UserAccessCreateFromTemplateProps = {
  visible: boolean;
  entityId: number;
  onClose: (uaserAccessId: number | undefined) => void;
};

type UserAccessTemplate = UserAccessTemplateQuery["userAccessTemplate"];

function UserAccessCreateFromTemplate(props: UserAccessCreateFromTemplateProps) {
  const [templateData, setTemplateData] = useState<UserAccessTemplate | undefined>(undefined);
  const [accessInputs, setAccessInputs] = useState<AccessAttributes | undefined>(undefined);
  const [saveUserAccess] = useUserAccessSaveMutation();
  const [getTemplate] = useLazyUserAccessTemplateQuery();
  const {data: optTemplates} = useCodeListUserAccessTemplatesQuery();
  const {data: cfg} = useConfigQuery();
  const toast = useToast();

  const formik = useFormik({
    initialValues: {
      templateid: 0,
    },
    validate: (data) => {
      let errors: FormikErrors<{ accessInputs: string; templateid: string }> = {};
      if (data.templateid === 0) {
        errors.templateid = cannotBeEmpty;
      }
      return errors;
    },
    onSubmit: async (data) => {
      try {
        const ret = await saveUserAccess({
          data: {
            id: undefined,
            name: templateData?.name || "",
            fwConfigId: templateData?.fwConfig.id || 0,
            entityId: props.entityId,
            groupsIds: templateData?.groups.map((g) => g.id) || [],
            userAccessTemplateId: Number(data.templateid),
            validTo: new Date(templateData?.validTo),
          },
        }).unwrap();
        props.onClose(ret.userAccessSave.id);
        toast.show({
          severity: "success",
          detail: `User Access '${templateData?.name}' has been saved successfully`,
          life: 4000,
        });
      } catch (ex) {
        let e = ex as RequestError;
        let emsg = "An unknown error occurred while saving the user access";
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
      formik.resetForm();
      setAccessInputs(undefined);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.visible]
  );

  const isFieldInvalid = (name: "templateid") => !!(formik.touched[name] && formik.errors[name]);
  const getFormErrorMessage = (name: "templateid") => {
    return isFieldInvalid(name) && <small className="p-error">{formik.errors[name]}</small>;
  };
  const onSave = useCallback(() => formik.submitForm(), [formik]);
  const onCancel = useCallback(() => {
    props.onClose(undefined);
  }, [props]);

  const onTemplateChange = (e: any) => {
    setTemplateData(undefined);
    setAccessInputs(undefined);
    actionLoadTemplate(e.value);
  };

  useEffect(
    () => {
      if (props.visible && templateData !== undefined) {
        formik.setValues({
          templateid: templateData.id,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [templateData]
  );

  const actionLoadTemplate = async (tid: number) => {
    if (tid === 0) {
      setTemplateData(undefined);
      return;
    }
    try {
      const template = await getTemplate({ userAccessTemplateId: tid }).unwrap();
      setTemplateData(template.userAccessTemplate);
      setAccessInputs({
        name: template.userAccessTemplate.name,
        firewallid: template.userAccessTemplate.fwConfig.id,
        validtotype: new Date(template.userAccessTemplate.validTo).getTime() === new Date(cfg?.config?.maxCertificateValidity).getTime() ? "max" : "custom",
        validto: DateFormat.toReadableString(template.userAccessTemplate.validTo),
        groups: template.userAccessTemplate.groups.map((g) => g.name),
      });
    } catch (ex) {
      let e = ex as RequestError;
      let emsg = "An unknown error occurred while loading the access card template settings";
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

  return (
    <SidePanel title="Create access card from template" onClose={onCancel} visible={props.visible}>
      <>
        <div className="side-panel-content side-panel-content-section">
          <form onSubmit={formik.handleSubmit}>
            <div className="field">
              <label htmlFor="templateid">Available access card templates</label>
              <Dropdown
                id="templateid"
                name="templateid"
                value={formik.values.templateid}
                placeholder="Select access card template"
                className={classNames("w-full", { "p-invalid": isFieldInvalid("templateid") })}
                onChange={(e) => {
                  formik.handleChange(e);
                  onTemplateChange(e);
                }}
                options={optTemplates?.codelistUserAccessTemplates}
                optionLabel="name"
                optionValue="id"
              />
              {getFormErrorMessage("templateid")}
            </div>
            {formik.values.templateid !== 0 && (
              <>
                <h3>Access details</h3>
                <p>Values for this access can only be changed in Access card templates</p>
                <AccessInputs disabled={true} visible={props.visible} showName={true} values={accessInputs} />
              </>
            )}
          </form>
        </div>
        <div className="side-panel-controls">
          <Button label="Create" className="p-button-sm" icon="fa-regular fa-save" onClick={onSave} />
          <Button label="Cancel" className="p-button-sm p-button-secondary" onClick={onCancel} />
        </div>
      </>
    </SidePanel>
  );
}

export default UserAccessCreateFromTemplate;
