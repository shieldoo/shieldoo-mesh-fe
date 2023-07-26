import React, { useEffect, useState, useCallback, useMemo } from "react";
import {  useNavigate, useParams } from "react-router-dom";

import Page from "../../../components/Page";
import { UserSaveMutation, useUserDetailQuery, useUserDeleteMutation } from "../../../api/generated";
import { RequestError } from "../../../api/graphqlBaseQueryTypes";
import useToast from "../../../hooks/useToast";
import EditUserDialog from "../UserEditDialog";
import CustomBar from "./CustomBar";
import { AppRoute, IAppRoute } from "../../../AppRoute";
import UserAccessesList from "./UserAccessesList";
import DeleteDialog from "../../../components/DeleteDialog";
import WarningContent from "../../../components/WarningContent";

type User = UserSaveMutation["userSave"];

function UserDetail() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);

  const [deleteUser] = useUserDeleteMutation();
  const { data: editUser, refetch: refetchUser, isError: editUserIsError, error: editUserError } = useUserDetailQuery({ id: id });
  const [errorNotFound, setErrorNotFound] = useState<boolean>(false);
  const [deleteUserDialogVisible, setDeleteUserDialogVisible] = useState<boolean>(false);
  const [editUserOpened, setEditUserOpened] = useState<boolean>(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (editUserIsError) {
      let e = editUserError as RequestError;
      let emsg = "An unknown error occurred while loading the firewall";
      if (e.errors.length > 0) {
        emsg = e.errors[0].message;
      }
      if (emsg === "not a user") {
        setErrorNotFound(true);
      } else {
        toast.show({
          severity: "error",
          detail: emsg,
          life: 4000,
        });
      }
    } else {
      setErrorNotFound(false);
    }
  }, [editUserIsError, editUserError, toast]);

  const userDescription = useMemo(() => {
    let result = editUser?.user.name || "";
    if (editUser?.user.description) {
      result += " | " + editUser?.user.description;
    }
    if (editUser?.user.roles?.includes("ADMINISTRATOR")) {
      result += " | Admin rights";
    } else {
      result += " | No admin rights";
    }
    return result;
  }, [editUser]);

  const onDelete = useCallback(() => {
    setDeleteUserDialogVisible(true);
  }, []);

  const onEdit = useCallback(() => {
    setEditUserOpened(true);
  }, []);

  const closeUserEditDialog = (user: User | null) => {
    if (user) {
      refetchUser();
    }
    setEditUserOpened(false);
  };

  const onDataChanged = () => {
    refetchUser();
  };

  const onDeleteServer = async () => {
    try {
      await deleteUser({ id: id }).unwrap();
      toast.show({
        severity: "success",
        detail: `The user '${editUser?.user.upn}' has been deleted successfully`,
        life: 4000,
      });
      navigate(AppRoute.Users);
    } catch (ex) {
      let e = ex as RequestError;
      let emsg = "An unknown error occurred while deleting the user";
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
    <Page windowTitle={userDetailRoute.title} className="page-entity-detail" topBar={<CustomBar userAccessesCount={editUser?.user.userAccesses?.length || 0} onDelete={onDelete} onEdit={onEdit} userName={editUser?.user?.name || ""} userDescription={userDescription} userNotFound={errorNotFound} />}>
      {errorNotFound ? (
        <WarningContent
          title="User Not Found"
          content="This user does not exist."
          type="error"
        />
      ) : (
        <>
          <div className="content-wrapper">
            <UserAccessesList user={editUser?.user} onDataChanged={onDataChanged} />
          </div>
          <EditUserDialog visible={editUserOpened} userId={id} onClose={closeUserEditDialog} />
          <DeleteDialog message={
            <>
              Are you sure you want to delete user <span className="font-bold">{editUser?.user.name}</span>?<br />
              This action can not be undone.
            </>
          } header="Delete User" accept={onDeleteServer} onHide={() => setDeleteUserDialogVisible(false)} visible={deleteUserDialogVisible} />
        </>
      )}
    </Page>
  );
}

const userDetailRoute: IAppRoute = {
  path: () => AppRoute.UserDetail,
  page: <UserDetail />,
  title: "User Detail",
  iconClassName: "fa-regular fa-users",
  isAdminPage: true,
  isHidden: true,
};

export default userDetailRoute;