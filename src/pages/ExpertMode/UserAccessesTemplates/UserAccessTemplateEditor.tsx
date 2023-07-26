import { useCallback, useEffect, useState } from "react";
import { Button } from "primereact/button";

import { FormikErrors, useFormik } from "formik";
import SidePanel from "../../../components/SidePanel";

import { useCodeListGroupsQuery, useLazyUserAccessTemplateQuery, UserAccessTemplateQuery, useUserAccessTemplateSaveMutation } from "../../../api/generated";
import { RequestError } from "../../../api/graphqlBaseQueryTypes";
import useToast from "../../../hooks/useToast";
import { useSelector } from "react-redux";
import { selectors } from "../../../ducks/auth";
import DateFormat from "../../../Common/Utils/DateFormat";
import AccessInputs, { AccessAttributes } from "../../../components/AccessInputs";
import { InputTextarea } from "primereact/inputtextarea";

type UserAccessTemplateEditorProps = {
  visible: boolean;
  accessId: number;
  onClose: (accessId: number | null) => void;
};

type UserAccessTemplate = UserAccessTemplateQuery["userAccessTemplate"];

function UserAccessTemplateEditor(props: UserAccessTemplateEditorProps) {
  const [accessInputsValid, setAccessInputsValid] = useState<boolean>(false);
  const [accessInputs, setAccessInputs] = useState<AccessAttributes | undefined>(undefined);
  const [editedAccess, setEditedAccess] = useState<UserAccessTemplate | undefined>(undefined);
  const [getAccess] = useLazyUserAccessTemplateQuery();
  const { data: optionsGroup } = useCodeListGroupsQuery();
  const [saveAccess] = useUserAccessTemplateSaveMutation();
  const toast = useToast();
  const config = useSelector(selectors.selectUiConfig);

  useEffect(() => {
    const actionGetAccess = async (id: number) => {
      try {
        const acc = await getAccess({ userAccessTemplateId: id }).unwrap();
        setEditedAccess(acc.userAccessTemplate);
      } catch (ex) {
        let e = ex as RequestError;
        let emsg = "An unknown error occurred while loading the access card template";
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

    if (props.visible && props.accessId !== 0) {
      actionGetAccess(props.accessId);
    } else {
      setEditedAccess(undefined);
    }
  }, [props.visible, props.accessId, toast, getAccess]);

  const formik = useFormik({
    initialValues: {
      description: "",
      name: "",
      groups: new Array<string>(),
      firewallid: 0,
      validtotype: "max",
      validto: "",
    },
    validate: () => {
      let errors: FormikErrors<{ accessInputs: string }> = {};
      if (!accessInputsValid) {
        errors.accessInputs = "Access inputs are invalid";
      }
      return errors;
    },
    onSubmit: async (data) => {
      try {
        const ret = await saveAccess({
          data: {
            id: editedAccess?.id || undefined,
            deleted: false,
            fwConfigId: data.firewallid,
            groupsIds: data.groups.map((g) => {
              return optionsGroup?.codelistGroups?.find((go) => go.name === g)?.id || 0;
            }),
            name: data.name,
            validTo: data.validtotype === "max" ? new Date(config?.maxCertificateValidity) : new Date(data.validto),
            description: data.description,
          },
        }).unwrap();
        props.onClose(ret.userAccessTemplateSave?.id);
        toast.show({
          severity: "success",
          detail: `Access card template '${data.description}' has been saved successfully`,
          life: 4000,
        });
      } catch (ex) {
        let e = ex as RequestError;
        let emsg = "There was a problem saving the access card template";
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
      if (editedAccess) {
        const ival = {
          name: editedAccess.name,
          firewallid: editedAccess.fwConfig.id,
          description: editedAccess.description || "",
          groups: editedAccess.groups.map((g) => g.name) || new Array<string>(),
          validtotype: new Date(editedAccess.validTo).getTime() === new Date(config?.maxCertificateValidity).getTime() ? "max" : "custom",
          validto: DateFormat.toReadableString(editedAccess.validTo),
        };
        formik.setValues(ival);
        setAccessInputs({ name: ival.name, firewallid: ival.firewallid, groups: ival.groups, validtotype: ival.validtotype, validto: ival.validto });
      } else {
        formik.resetForm();
        setAccessInputs(undefined);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editedAccess]
  );

  const onSave = useCallback(() => formik.submitForm(), [formik]);
  const onCancel = useCallback(() => {
    props.onClose(null);
  }, [props]);

  return (
    <SidePanel title={editedAccess?.id ? editedAccess.name : "Create Access Card Template"} onClose={onCancel} visible={props.visible}>
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
          <Button label={editedAccess?.id ? "Save" : "Create"} icon={editedAccess?.id ? "fa-regular fa-save" : "fa-regular fa-plus"} className="p-button-sm" onClick={onSave} />
          <Button label="Cancel" className="p-button-sm p-button-secondary" onClick={onCancel} />
        </div>
      </>
    </SidePanel>
  );
}

export default UserAccessTemplateEditor;
