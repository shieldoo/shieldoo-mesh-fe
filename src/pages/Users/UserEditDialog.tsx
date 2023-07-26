import { useCallback, useEffect, useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";

import { classNames } from "primereact/utils";
import { FormikErrors, useFormik } from "formik";

import SidePanel from "../../components/SidePanel";
import { UserData, useLazyUserQuery, useUserSaveMutation, useUserInviteMutation, UserSaveMutation, useCodeListUserAccessTemplatesQuery } from "../../api/generated";
import { RequestError } from "../../api/graphqlBaseQueryTypes";
import useToast from "../../hooks/useToast";
import { Dropdown } from "primereact/dropdown";
import Validate from "../../Common/Utils/Validate";
import { cannotBeEmpty } from "../../Common/Constants/validationMessages";

type EditUserDialogProps = {
  visible: boolean;
  userId: number | undefined;
  onClose: (user: User | null) => void;
};

type User = UserSaveMutation["userSave"];

function CreateEditDialog(props: EditUserDialogProps) {
  const [editedUser, setEditedUser] = useState<UserData | undefined>(undefined);
  const { data: templatesData, isError: templatesIsError } = useCodeListUserAccessTemplatesQuery();
  const toast = useToast();
  const [getUser] = useLazyUserQuery();
  const [saveUser] = useUserSaveMutation();
  const [userInvite] = useUserInviteMutation();
  const isEditMode = props.userId !== undefined;

  useEffect(() => {
    if (templatesIsError) {
      toast.show({
        severity: "error",
        detail: "Error loading access card templates",
        life: 4000,
      });
    }
  } , [templatesIsError, toast]);

  useEffect(() => {
    const actionGetUser = async (id: number) => {
      try {
        const usr = await getUser({ id: id }).unwrap();
        let loadedUser: User = { ...usr.user };
        setEditedUser(loadedUser);
      } catch (ex) {
        let e = ex as RequestError;
        let emsg = "An unknown error occurred while loading user settings";
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
      if (props.userId === undefined) {
        setEditedUser({
          id: 0,
          name: "",
          description: "",
          upn: "",
          roles: [],
          origin: "",
        });
      } else {
        actionGetUser(props.userId);
      }
    } else {
      setEditedUser(undefined);
    }
  }, [props.visible, props.userId, getUser, toast]);

  const formik = useFormik({
    initialValues: {
      name: "",
      upn: "",
      isadmin: false,
      description: "",
      templateid: undefined,
    },
    validate: (data) => {
      let errors: FormikErrors<{ name: string; upn: string }> = {};

      if (!data.name) {
        errors.name = cannotBeEmpty;
      }

      if (!data.upn) {
        errors.upn = cannotBeEmpty;
      } else if (Validate.validateEmail(data.upn) === null) {
        errors.upn = "This value must be a valid email address.";
      }

      return errors;
    },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        let retupn;
        if (props.userId === undefined && values.templateid) {
          const ret = await userInvite({
            data: {
              name: values.name,
              upn: values.upn,
              roles: values.isadmin ? ["ADMINISTRATOR"] : [],
              description: values.description,
              userAccessTemplateId: values.templateid,
            },
          }).unwrap();
          retupn = ret.userInvite.upn;
          props.onClose(ret.userInvite);
        } else {
          const ret = await saveUser({
            data: {
              id: props.userId,
              name: values.name,
              upn: values.upn,
              roles: values.isadmin ? ["ADMINISTRATOR"] : [],
              description: values.description,
            },
          }).unwrap();
          retupn = ret.userSave.upn;
          props.onClose(ret.userSave);
        }
        toast.show({
          severity: "success",
          detail: `User '${retupn}' has been ${props.userId === undefined ? "invited" : "saved"} successfully`,
          life: 4000,
        });
      } catch (ex) {
        let e = ex as RequestError;
        let emsg = `An unknown error occurred while ${props.userId === undefined ? "inviting" : "saving"} the user`;
        if (e.errors.length > 0) {
          emsg = e.errors[0].message;
        }
        toast.show({
          severity: "error",
          detail: emsg,
          life: 4000,
        });
      }
      setSubmitting(false);
    },
  });

  useEffect(
    () => {
      if (editedUser) {
        formik.setValues({
          name: editedUser.name,
          upn: editedUser.upn,
          isadmin: editedUser.roles.includes("ADMINISTRATOR"),
          description: editedUser.description || "",
          templateid: undefined,
        });
      } else {
        formik.resetForm();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editedUser]
  );

  const isFieldInvalid = (name: "name" | "upn") => !!(formik.touched[name] && formik.errors[name]);
  const getFormErrorMessage = (name: "name" | "upn") => {
    return isFieldInvalid(name) && <small className="p-error">{formik.errors[name]}</small>;
  };

  const onSave = useCallback(() => formik.submitForm(), [formik]);
  const onCancel = useCallback(() => {
    props.onClose(null);
  }, [props]);

  return (
    <>
      <SidePanel title={`${isEditMode ? "Edit" : "Invite"} User`} onClose={onCancel} visible={props.visible}>
        {editedUser && (
          <>
            <div className="side-panel-content side-panel-content-section">
              <form onSubmit={formik.handleSubmit}>
                {!isEditMode && (
                  <>
                    <h3>Access Rights</h3>
                    <p>You must assign at least one access right to the user to let them access your network. After sending the invitation, you can assign more rights to them or create new ones.</p>

                    <div className="field">
                      <label htmlFor="user-template">Available card templates</label>
                      <Dropdown id="user-template" name="templateid" value={formik.values.templateid} placeholder="Select" className="w-full" onChange={formik.handleChange} options={templatesData?.codelistUserAccessTemplates} optionLabel="name" optionValue="id" />
                    </div>
                    <h3>User</h3>
                  </>
                )}
                <div className="field">
                  <label htmlFor="user-name">Name</label>
                  <InputText id="user-name" name="name" value={formik.values.name} className={classNames("w-full", { "p-invalid": isFieldInvalid("name") })} onChange={formik.handleChange} />
                  {getFormErrorMessage("name")}
                </div>
                <div className="field">
                  <label htmlFor="user-upn">Email</label>
                  <InputText id="user-upn" name="upn" value={formik.values.upn} className={classNames("w-full", { "p-invalid": isFieldInvalid("upn") })} onChange={formik.handleChange} />
                  {getFormErrorMessage("upn")}
                </div>
                <div className="field">
                  <label htmlFor="user-isadmin" className="block">
                    Admin rights
                  </label>
                  <Dropdown
                    style={{ width: "7em" }}
                    id="user-isadmin"
                    name="isadmin"
                    value={formik.values.isadmin}
                    options={[
                      { label: "Yes", value: true },
                      { label: "No", value: false },
                    ]}
                    onChange={formik.handleChange}
                  />
                </div>
                <div className="field">
                  <label htmlFor="user-description">Description</label>
                  <InputTextarea id="user-description" name="description" value={formik.values.description} className="w-full" onChange={formik.handleChange} rows={4} autoResize />
                </div>
              </form>
            </div>
            <div className="side-panel-controls-split">
              <div className="side-panel-controls-split-left">
                {!isEditMode && (
                  <>
                    <i className="fa fa-info-circle"></i> On sending invitation user will be automatically notified via email.
                  </>
                )}
              </div>
              <div className="side-panel-controls-split-right">
                <Button className="bright" label={isEditMode ? "Save" : "Invite"} icon={isEditMode ? "fa-regular fa-save" : "fa-regular fa-send"} onClick={onSave} />
                <Button label="Cancel" className="p-button-sm p-button-secondary" onClick={onCancel} />
              </div>
              <div></div>
            </div>
          </>
        )}
      </SidePanel>
    </>
  );
}
export default CreateEditDialog;
