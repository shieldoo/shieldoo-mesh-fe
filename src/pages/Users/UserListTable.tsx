import React, { useMemo, useRef, useState } from "react";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";
import { generatePath, Link, useNavigate } from "react-router-dom";

import ProfilePortrait from "../../components/ProfilePortrait";
import { useUserSaveMutation, useUserDeleteMutation } from "../../api/generated";
import UserEditDialog from "./UserEditDialog";
import { AppRoute } from "../../AppRoute";
import useExpertMode from "../../hooks/useExpertMode";
import DeleteDialog from "../../components/DeleteDialog";
import DataTable from "../../components/DataTable";
import { wrapLinks } from "../../Common/Utils/ParseUtils";
import { useSelector } from "react-redux";
import { selectors } from "../../ducks/auth";

export interface ListedUser {
  id: number;
  name: string;
  upn: string;
  roles: (string | null)[];
  imgUrl?: string;
  description?: string | null | undefined;
  groups: string;
  origin?: string | null | undefined;
}

export type UserDropDownMenuProps = {
  user: ListedUser;
  onModify?: (modifiedUser: Partial<ListedUser>) => void;
  onDelete?: (userId: number) => void;
  onEditClick: (user: ListedUser) => void;
  errorHandler?: (errorMessage: string) => void;
};

type UserListTableProps = {
  users: ListedUser[];
  loading: boolean;
  onRowModified?: (modifiedUser: Partial<ListedUser>) => void;
  onRowDeleted?: (userId: number) => void;
  errorHandler?: (errorMessage: string) => void;
};

function UserDropDownMenu(props: UserDropDownMenuProps) {
  const popupMenu = useRef<Menu>(null);
  const isAdmin = props.user.roles.includes("ADMINISTRATOR");
  const [adminRightsConfirmDialogVisible, setAdminRightsConfirmDialogVisible] = useState<boolean>(false);
  const [deleteUserDialogVisible, setDeleteUserDialogVisible] = useState<boolean>(false);
  const [saveUser] = useUserSaveMutation();
  const [deleteUser] = useUserDeleteMutation();
  const navigate = useNavigate();
  const { isExpertModeSet } = useExpertMode();
  const config = useSelector(selectors.selectUiConfig);

  /**
   * Toggles administrator privileges for user that belongs to this dropdown menu
   */
  const toggleAdmin = () => {
    let userData = { ...props.user };

    userData.roles = userData.roles.includes("ADMINISTRATOR") ? userData.roles.filter((r) => r !== "ADMINISTRATOR") : [...userData.roles, "ADMINISTRATOR"];

    saveUser({ data: (({ id, name, roles, upn }) => ({ id, name, roles, upn }))(userData) }).then((response) => {
      if ("error" in response) {
        props.errorHandler?.("An error occurred while saving the user");
      } else {
        props.onModify?.(userData);
      }
    });
  };

  const onDeleteUser = () => {
    deleteUser({ id: props.user.id }).then((response) => {
      if ("error" in response) {
        props.errorHandler?.("An error occurred while deleting the user");
      } else {
        props.onDelete?.(props.user.id);
      }
    });
  };

  const menuItems = useMemo(() => {
    const menuItemsBaseExpert: MenuItem[] = [
      {
        label: "Detail",
        icon: "fa-regular fa-user",
        command: () => {
          const path = generatePath(AppRoute.UserDetail, { id: props.user.id.toString() });
          navigate(path);
        },
      },
    ];

    const menuItemsBase: MenuItem[] = [
      {
        label: "Edit",
        icon: "fa-regular fa-edit",
        command: () => {
          props.onEditClick(props.user);
        },
      },
      {
        label: isAdmin ? "Revoke admin rights" : "Grant admin rights",
        icon: isAdmin ? "fa-regular fa-ban" : "fa-regular fa-check",
        command: () => {
          setAdminRightsConfirmDialogVisible(true);
        },
      },
      {
        separator: true,
      },
      {
        label: "Delete",
        icon: "fa-regular fa-trash",
        className: "danger",
        command: () => {
          setDeleteUserDialogVisible(true);
        },
      },
    ];

    let filteredMenu: MenuItem[] = [];
    if (!config?.identityImportEnabled){
      filteredMenu = menuItemsBase;
    }

    return isExpertModeSet ? [...menuItemsBaseExpert, ...filteredMenu] : filteredMenu;
  }, [isAdmin, isExpertModeSet, navigate, props, config]);

  return (
    <div className="flex">
      <Menu model={menuItems} className="user-dropdown-menu" popup ref={popupMenu} id={"user-dropdown-" + props.user.id} />
      <Button className="p-button-link" icon="fa-regular fa-ellipsis-v" onClick={(e) => popupMenu.current?.toggle(e)} aria-controls={"user-dropdown-" + props.user.id} aria-haspopup />
      <ConfirmDialog message={props.user.roles.includes("ADMINISTRATOR") ? `Are you sure you want to revoke the admin rights of the user ${props.user.name}?` : `Are you sure you want to grant the admin rights to the user  ${props.user.name}?`} header="Confirmation" accept={toggleAdmin} onHide={() => setAdminRightsConfirmDialogVisible(false)} visible={adminRightsConfirmDialogVisible} />
      <DeleteDialog
        message={
          <>
            Are you sure you want to delete user <span className="font-bold">{props.user.name}</span>?<br />
            This action can not be undone.
          </>
        }
        header="Delete User"
        accept={onDeleteUser}
        onHide={() => setDeleteUserDialogVisible(false)}
        visible={deleteUserDialogVisible}
      />
    </div>
  );
}

function UserListTable(props: UserListTableProps) {
  const [editUserDialogVisible, setEditUserDialogVisible] = useState<boolean>(false);
  const [editedUser, setEditedUser] = useState<ListedUser>();
  const { isExpertModeSet } = useExpertMode();

  const isAdminCellContent = (user: ListedUser) => {
    return user.roles.includes("ADMINISTRATOR") ? <i className="fa fa-check-circle mr-2" style={{ color: "#039000" }}></i> : <i className="fa fa-minus-circle mr-2" style={{ color: "#757575" }}></i>;
  };

  const groupsCellContent = (user: ListedUser) => {
    return <span>{user.groups}</span>;
  };

  const actionsCellContent = (user: ListedUser) => {
    return <UserDropDownMenu user={user} onModify={(data) => props.onRowModified?.(data)} onDelete={(id) => props.onRowDeleted?.(id)} onEditClick={onEditClick} errorHandler={props.errorHandler} />;
  };

  const nameCellContent = (user: ListedUser) => {
    return (
      <>
        <ProfilePortrait imageUrl={user.imgUrl} profileName={user.name} />
        {isExpertModeSet && (
          <Link className="onclick" to={generatePath(AppRoute.UserDetail, { id: user.id.toString() })}>
            {user.name}
          </Link>
        )}
        {!isExpertModeSet && <span>{user.name}</span>}
        {user.origin === "invited" && <Tag value="INVITED" severity="warning" />}
      </>
    );
  };

  const onEditClick = (user: ListedUser): void => {
    setEditedUser(user);
    setEditUserDialogVisible(true);
  };

  const onEditClosed = (user: Partial<ListedUser> | null): void => {
    if (user) {
      props.onRowModified?.(user);
    }
    setEditUserDialogVisible(false);
  };

  return (
    <>
      <DataTable className="user-list-table" lazy value={props.users} responsiveLayout="stack" loading={props.loading} emptyMessage="No users found">
        <Column style={{ width: "30%" }} field="name" header="Name" body={nameCellContent}></Column>
        <Column style={{ width: "25%" }} field="upn" header="Email"></Column>
        <Column style={{ width: "15%" }} field="roles" header="Profiles" body={groupsCellContent} className="cut-text"></Column>
        <Column style={{ width: "1%" }} field="isAdmin" header="Admin" body={isAdminCellContent} align="center"></Column>
        <Column
          style={{ width: "23%" }}
          field="description"
          header="Note"
          className="cut-text"
          body={data => wrapLinks(data.description)}
        />
        <Column style={{ width: "1%" }} header="" body={actionsCellContent}></Column>
      </DataTable>
      <UserEditDialog userId={editedUser?.id} visible={editUserDialogVisible} onClose={onEditClosed} />
    </>
  );
}

export default UserListTable;
