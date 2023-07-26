import React, { useCallback, useRef, useState } from "react";
import { Panel } from "primereact/panel";
import { UserAccess, UserDetailQuery, useUserAccessDeleteMutation } from "../../../api/generated";
import { Button } from "primereact/button";
import { DataTableExpandedRows } from "primereact/datatable";
import { Column } from "primereact/column";
import UserAccessEdit from "./UserAccessEdit";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import { useSelector } from "react-redux";

import { RequestError } from "../../../api/graphqlBaseQueryTypes";
import useToast from "../../../hooks/useToast";
import DateFormat from "../../../Common/Utils/DateFormat";
import MenuButton from "../../../components/MenuButton";
import UserAccessCreateFromTemplate from "./UserAccessCreateFromTemplate";
import { selectors } from "../../../ducks/auth";
import DeleteDialog from "../../../components/DeleteDialog";
import DataTable from "../../../components/DataTable";

type UserDetailData = UserDetailQuery["user"];
type UserAccessListProps = {
  user: UserDetailData | undefined;
  onDataChanged: () => void;
};

function UserAccessesList(props: UserAccessListProps) {
  const [expandedRows, setExpandedRows] = useState<any[] | DataTableExpandedRows | undefined>(undefined);
  const [editShow, setEditShow] = useState<boolean>(false);
  const [createFromTemplate, setCreateFromTemplate] = useState<boolean>(false);
  const [editUserAccess, setEditUserAccess] = useState<UserAccess | undefined>(undefined);
  const [deleteAccess] = useUserAccessDeleteMutation();
  const toast = useToast();
  const noAccessExists = props.user?.userAccesses?.length === 0;
  const config = useSelector(selectors.selectUiConfig);

  const onCreate = useCallback(() => {
    setEditUserAccess(undefined);
    setCreateFromTemplate(false);
    setEditShow(true);
  }, [setEditUserAccess, setCreateFromTemplate, setEditShow]);

  const onCreateFromTemplate = useCallback(() => {
    setEditUserAccess(undefined);
    setCreateFromTemplate(true);
    setEditShow(false);
  }, [setEditUserAccess, setCreateFromTemplate, setEditShow]);

  const rowExpansionTemplateRow = (label: string, text: string) => {
    return (
      <tr className="access-expand-row" draggable="false">
        <td className="access-expand-label access-expand-col" role="cell" style={{ width: "25%" }}>
          {label}
        </td>
        <td className="access-expand-col" style={{ width: "75%" }}>
          {text}
        </td>
      </tr>
    );
  };

  const rowExpansionTemplate = (data: UserAccess) => {
    return (
      <table className="p-datatable-table" role="table">
        <tbody className="p-datatable-tbody">
          {rowExpansionTemplateRow("Firewall configuration:", data.fwConfig.name || "")}
          {rowExpansionTemplateRow("Groups:", data.groups.length === 0 ? "-" : data.groups.map((group) => group.name).join(", "))}
          {rowExpansionTemplateRow("Description:", data.description || "")}
        </tbody>
      </table>
    );
  };

  function ContextMenu(access: UserAccess) {
    const popupMenu = useRef<Menu>(null);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState<boolean>(false);

    const menuItems: MenuItem[] = [
      {
        label: "Edit",
        icon: "fa-regular fa-pencil",
        command: () => {
          setEditUserAccess(access);
          setCreateFromTemplate(false);
          setEditShow(true);
        },
      },
      {
        label: "Delete",
        icon: "fa-regular fa-trash",
        className: "danger",
        command: () => {
          setDeleteDialogVisible(true);
        },
      },
    ];

    const actionDeleteAccess = async () => {
      try {
        await deleteAccess({ userAccessDeleteId: access.id }).unwrap();
        props.onDataChanged();
        toast.show({
          severity: "success",
          detail: `The user access '${access.name}' has been deleted successfully`,
          life: 4000,
        });
      } catch (ex) {
        let e = ex as RequestError;
        let emsg = "An unknown error occurred while deleting the user access";
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
      <div className="flex">
        <Menu model={menuItems} className="user-dropdown-menu" popup ref={popupMenu} />
        <Button className="p-button-link" icon="fa-regular fa-ellipsis-v" onClick={(e) => popupMenu.current?.toggle(e)} />
        <DeleteDialog message="Are you sure you want to delete this access?" header="Delete Access" accept={actionDeleteAccess} onHide={() => setDeleteDialogVisible(false)} visible={deleteDialogVisible} />
      </div>
    );
  }

  const onUserAccessEditClose = (userAccessId: number | undefined) => {
    if (userAccessId !== undefined) {
      props.onDataChanged();
    }
    setEditShow(false);
    setEditUserAccess(undefined);
    setCreateFromTemplate(false);
  };

  function FormatValidFromDate(d: UserAccess) {
    return <>{DateFormat.toReadableString(d.validFrom)}</>;
  }

  function FormatValidToDate(d: UserAccess) {
    let ret;
    if (d.validTo >= config?.maxCertificateValidity) {
      ret = "Max (" + DateFormat.toReadableString(d.validTo) + ")";
    } else {
      ret = DateFormat.toReadableString(d.validTo);
    }
    return ret;
  }

  const createItems = [
    { label: "From template", command: onCreateFromTemplate },
    { label: "From scratch", command: onCreate },
  ];

  return (
    <>
      {noAccessExists && (
        <Panel>
          <div>
            <div className="no-access-foun-content">
              <i className="fa fa-eye no-access-found"></i>
              <h2>No access card assigned</h2>
              <p>A user must have at least one access right or he won't be able to move around your network.</p>
              {!config?.identityImportEnabled && <MenuButton text="Create Access Card" icon="fa-regular fa-plus" model={createItems} />}
            </div>
          </div>
        </Panel>
      )}
      {!noAccessExists && (
        <>
          <div className="access-add-button-content">
          {!config?.identityImportEnabled &&<MenuButton text="Create Access Card" icon="fa-regular fa-plus" model={createItems} />}
          </div>
          <DataTable className="user-access-list-table" lazy value={props.user?.userAccesses} expandedRows={expandedRows} onRowToggle={(e) => setExpandedRows(e.data)} rowExpansionTemplate={rowExpansionTemplate} responsiveLayout="stack" emptyMessage="No access found">
            <Column expander />
            <Column style={{ width: "45%" }} field="name" header="Name"></Column>
            <Column style={{ width: "25%" }} field="validFrom" header="Valid From" body={FormatValidFromDate}></Column>
            <Column style={{ width: "25%" }} field="validTo" header="Valid To" body={FormatValidToDate}></Column>
            <Column style={{ width: "5%" }} header="Action" body={ContextMenu}></Column>
          </DataTable>
        </>
      )}
      <UserAccessEdit visible={editShow} entityId={props.user?.id || 0} userAccess={editUserAccess} onClose={onUserAccessEditClose} />
      <UserAccessCreateFromTemplate visible={createFromTemplate} entityId={props.user?.id || 0} onClose={onUserAccessEditClose} />
    </>
  );
}

export default UserAccessesList;
