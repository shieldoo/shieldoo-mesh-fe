import { FormikErrors, useFormik } from "formik";
import { Button } from "primereact/button";
import { useCallback, useEffect, useState } from "react";
import { CodeListItem, useLazyCodeListGroupsQuery, UserAccess, useUserAccessSaveMutation } from "../../../api/generated";
import { RequestError } from "../../../api/graphqlBaseQueryTypes";
import SidePanel from "../../../components/SidePanel";
import useToast from "../../../hooks/useToast";
import DateFormat from "../../../Common/Utils/DateFormat";
import AccessInputs, { AccessAttributes } from "../../../components/AccessInputs";
import { useSelector } from "react-redux";
import { selectors } from "../../../ducks/auth";
import { InputTextarea } from "primereact/inputtextarea";

type UserAccessEditProps = {
  visible: boolean;
  userAccess: UserAccess | undefined;
  entityId: number;
  onClose: (uaserAccessId: number | undefined) => void;
};

function UserAccessEdit(props: UserAccessEditProps) {
  const [optionsGroup, setOptionsGroup] = useState<CodeListItem[] | undefined>(undefined);
  const [accessInputs, setAccessInputs] = useState<AccessAttributes | undefined>(undefined);
  const [accessInputsValid, setAccessInputsValid] = useState<boolean>(false);
  const [saveUserAccess] = useUserAccessSaveMutation();
  const [getGroups] = useLazyCodeListGroupsQuery();
  const toast = useToast();
  const config = useSelector(selectors.selectUiConfig);

  const optionsValidTo = ["max", "custom"];

  useEffect(() => {
    const fetcData = async () => {
      const dataG = await getGroups().unwrap();
      setOptionsGroup(dataG.codelistGroups);
    };
    if (optionsGroup === undefined) {
      fetcData().catch(() => {
        toast.show({
          severity: "error",
          detail: "Error loading codelists",
          life: 4000,
        });
      });
    }
  }, [getGroups, optionsGroup, toast]);

  const formik = useFormik({
    initialValues: {
      name: "",
      groups: new Array<string>(),
      firewallid: 0,
      validtotype: optionsValidTo[0],
      validto: "",
      description: "",
    },
    validate: () => {
      let errors: FormikErrors<{ accessInputs: string; templateid: string }> = {};
      if (!accessInputsValid) {
        errors.accessInputs = "Access inputs are not valid";
      }
      return errors;
    },
    onSubmit: async (data) => {
      try {
        const ret = await saveUserAccess({
          data: {
            id: props.userAccess === undefined ? undefined : props.userAccess.id,
            name: data.name,
            fwConfigId: Number(data.firewallid),
            entityId: props.entityId,
            groupsIds: data.groups.map((g) => {
              return optionsGroup?.find((go) => go.name === g)?.id || 0;
            }),
            description: data.description,
            userAccessTemplateId: props.userAccess === undefined ? undefined : props.userAccess.userAccessTemplate.id,
            validTo: data.validtotype === optionsValidTo[0] ? new Date(config?.maxCertificateValidity) : new Date(data.validto),
          },
        }).unwrap();
        props.onClose(ret.userAccessSave.id);
        toast.show({
          severity: "success",
          detail: `User Access '${data.name}' has been saved successfully`,
          life: 4000,
        });
      } catch (ex) {
        let e = ex as RequestError;
        let emsg = "There was a problem saving the user access";
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

  const onAccessInputChange = (e: any) => {
    formik.setValues({ ...formik.values, name: e.name, firewallid: e.firewallid, groups: e.groups, validtotype: e.validtotype, validto: e.validto });
  };
  const onAccessInputValidate = (e: boolean) => {
    setAccessInputsValid(e);
  };

  useEffect(
    () => {
      if (props.visible && props.userAccess !== undefined) {
        let ival = {
          ...formik.values,
          name: props.userAccess.name,
          groups: props.userAccess.groups.map((g) => g.name) || new Array<string>(),
          validtotype: new Date(props.userAccess.validTo).getTime() === new Date(config?.maxCertificateValidity).getTime() ? optionsValidTo[0] : optionsValidTo[1],
          firewallid: props.userAccess.fwConfig.id,
          validto: DateFormat.toReadableString(props.userAccess.validTo),
          description: props.userAccess.description || "",
        };
        formik.setValues(ival);
        setAccessInputs({ name: ival.name, firewallid: ival.firewallid, groups: ival.groups, validtotype: ival.validtotype, validto: ival.validto });
      } else {
        formik.resetForm();
        setAccessInputs(undefined);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config?.maxCertificateValidity, props.userAccess, props.visible]
  );

  const onSave = useCallback(() => formik.submitForm(), [formik]);
  const onCancel = useCallback(() => {
    props.onClose(undefined);
  }, [props]);

  return (
    <SidePanel title={props.userAccess?.id ? "Edit access card: " + formik.values.name : "Create access card"} onClose={onCancel} visible={props.visible}>
      <>
        <div className="side-panel-content side-panel-content-section">
          <form onSubmit={formik.handleSubmit}>
            <AccessInputs disabled={false} visible={props.visible} showName={true} values={accessInputs} onChange={onAccessInputChange} onValidate={onAccessInputValidate} />
            <div className="field">
              <label htmlFor="description">Description</label>
              <InputTextarea id="description" name="description" value={formik.values.description} className="w-full" onChange={formik.handleChange} rows={4} autoResize />
            </div>
          </form>
        </div>
        <div className="side-panel-controls">
          <Button label={props.userAccess?.id ? "Save" : "Create"} icon={props.userAccess?.id ? "fa-regular fa-save" : "fa-regular fa-plus"} className="p-button-sm" onClick={onSave} />
          <Button label="Cancel" className="p-button-sm p-button-secondary" onClick={onCancel} />
        </div>
      </>
    </SidePanel>
  );
}

export default UserAccessEdit;
