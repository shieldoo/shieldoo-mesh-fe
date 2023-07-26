import { useCallback, useEffect, useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import { classNames } from "primereact/utils";
import { FormikErrors, useFormik } from "formik";
import SidePanel from "../SidePanel";

import { Group, useLazyGroupQuery, useSaveGroupMutation } from "../../api/generated";
import { RequestError } from "../../api/graphqlBaseQueryTypes";
import useToast from "../../hooks/useToast";
import { cannotBeEmpty } from "../../Common/Constants/validationMessages";

type GroupDialogProps = {
  visible: boolean;
  groupId: number;
  onClose: (group: Group | null) => void;
};

function GroupDialog(props: GroupDialogProps) {
  const [editedGroup, setEditedGroup] = useState<Group | undefined>(undefined);
  const [getGroup] = useLazyGroupQuery();
  const [saveGroup] = useSaveGroupMutation();
  const toast = useToast();

  useEffect(() => {
    const actionGetGroup = async (id: number) => {
      try {
        const grp = await getGroup({ id: id }).unwrap();
        let loadedGrp: Group = {
          id: grp.group.id,
          name: grp.group.name,
          description: grp.group.description,
        };
        setEditedGroup(loadedGrp);
      } catch (ex) {
        let e = ex as RequestError;
        let emsg = "An unknown error occurred while loading the group settings";
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

    if (props.visible) {
      if (props.groupId !== 0) {
        actionGetGroup(props.groupId);
      } else {
        setEditedGroup({
          id: 0,
          name: "",
          description: "",
        });
      }
    } else {
      setEditedGroup(undefined);
    }
  }, [props.visible, props.groupId, getGroup, toast]);

  const groupForm = useFormik({
    initialValues: {
      name: "",
      description: "",
    },
    validate: (data) => {
      let errors: FormikErrors<{ name: string; description: string }> = {};

      if (!data.name) {
        errors.name = cannotBeEmpty;
      } else if (!/^[a-zA-Z0-9_.-]{2,128}$/i.test(data.name)) {
        errors.name = "Invalid input text. The allowed characters are: a-z A-Z 0-9 . - _";
      }

      return errors;
    },
    onSubmit: async (data) => {
      try {
        const ret = await saveGroup({
          data: {
            id: editedGroup!.id || undefined,
            ...data,
          },
        }).unwrap();
        const retgrp = {
          ...editedGroup!,
          id: ret.groupSave.id,
          name: data.name,
          description: data.description,
        };
        props.onClose(retgrp);
        toast.show({
          severity: "success",
          detail: `Group '${data.name}' has been saved successfully`,
          life: 4000,
        });
      } catch (ex) {
        let e = ex as RequestError;
        let emsg = "There was a problem saving the group";
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
      if (editedGroup) {
        groupForm.setValues({ name: editedGroup.name, description: editedGroup.description || "" });
      } else {
        groupForm.resetForm();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editedGroup]
  );

  const isFieldInvalid = (name: "name" | "description") => !!(groupForm.touched[name] && groupForm.errors[name]);
  const getFormErrorMessage = (name: "name" | "description") => {
    return isFieldInvalid(name) && <small className="p-error">{groupForm.errors[name]}</small>;
  };
  const onSave = useCallback(() => groupForm.submitForm(), [groupForm]);
  const onCancel = useCallback(() => {
    props.onClose(null);
  }, [props]);

  return (
    <>
      <SidePanel title={editedGroup && editedGroup.id ? editedGroup.name : "Create Group"} onClose={onCancel} visible={props.visible}>
        {editedGroup && (
          <>
            <div className="side-panel-content side-panel-content-section">
              <form onSubmit={groupForm.handleSubmit}>
                <div className="field">
                  <label htmlFor="group-name">Name</label>
                  <InputText disabled={!!editedGroup.id} id="group-name" name="name" value={groupForm.values.name} className={classNames("w-full", { "p-invalid": isFieldInvalid("name") })} onChange={groupForm.handleChange} />
                  {getFormErrorMessage("name")}
                </div>
                <div className="field">
                  <label htmlFor="group-description">Description</label>
                  <InputText id="group-description" name="description" value={groupForm.values.description} className="w-full" onChange={groupForm.handleChange} />
                </div>
              </form>
            </div>
            <div className="side-panel-controls">
              <Button label={editedGroup.id ? "Save" : "Create"} className="p-button-sm" icon={editedGroup.id ? "fa-regular fa-save" : "fa-regular fa-plus"} onClick={onSave} />
              <Button label="Cancel" className="p-button-sm p-button-text p-button-secondary" onClick={onCancel} />
            </div>
          </>
        )}
      </SidePanel>
    </>
  );
}

export default GroupDialog;
