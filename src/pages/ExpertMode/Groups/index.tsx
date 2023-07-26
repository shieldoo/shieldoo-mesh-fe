import React, { useCallback, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";

import { Group, useGroupsQuery, useGroupDeleteMutation } from "../../../api/generated";
import HeaderPanel from "../../../components/HeaderPanel";
import { wrapLinks } from "../../../Common/Utils/ParseUtils";
import { useDebounce } from "../../../hooks/useDebounce";
import { RequestError } from "../../../api/graphqlBaseQueryTypes";
import GroupEditor from "../../../components/GroupEditor";
import Page from "../../../components/Page";
import useToast from "../../../hooks/useToast";
import DeleteDialog from "../../../components/DeleteDialog";
import DataTable from "../../../components/DataTable";
import { AppRoute, IAppRoute } from "../../../AppRoute";

function Groups() {
  const [searchString, setSearchString] = useState("");
  const [editedGroupId, setEditedGroupId] = useState<number>(0);
  const [editedGroupVisible, setEditedGroupVisible] = useState<boolean>(false);
  const { debouncedValue: debouncedSearchString } = useDebounce(searchString);
  const { isFetching: isLoadingGroups, data: groupsData, refetch: refetchGroups, error } = useGroupsQuery({ name: "%" + debouncedSearchString + "%" });
  const [deleteGroup] = useGroupDeleteMutation();
  const toast = useToast();

  const onSearch = useCallback((searchVal: string) => setSearchString(searchVal), [setSearchString]);
  const addGroup = useCallback(() => {
    setEditedGroupVisible(true);
    setEditedGroupId(0);
  }, []);
  const onEditClose = (group: Group | null): void => {
    if (group) {
      refetchGroups();
    }
    setEditedGroupVisible(false);
    setEditedGroupId(0);
  };

  function ContextMenu(group: Group) {
    const popupMenu = useRef<Menu>(null);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState<boolean>(false);

    const menuItems: MenuItem[] = [
      {
        label: "Edit",
        icon: "fa-regular fa-pencil",
        command: () => {
          setEditedGroupId(group.id);
          setEditedGroupVisible(true);
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

    const actionDeleteGroup = async () => {
      try {
        await deleteGroup({ id: group.id }).unwrap();
        refetchGroups();
        toast.show({
          severity: 'success',
          detail: `The group '${group.name}' has been deleted successfully.`,
          life: 4000
        });
      } catch (ex) {
        let e = ex as RequestError;
        let emsg = "An unknown error occurred while deleting the group";
        if (e.errors.length > 0) {
          emsg = e.errors[0].message;
        }
        toast.show({
          severity: 'error',
          detail: emsg,
          life: 4000
        });
      }
    };  
  
    return <div className="flex">
      <Menu model={menuItems} className="user-dropdown-menu" popup ref={popupMenu}/>
      <Button className='p-button-link' icon="fa-regular fa-ellipsis-v" onClick={(e) => popupMenu.current?.toggle(e) }/>
      <DeleteDialog
        message={
          <>
            Are you sure you want to delete group <span className="font-bold">{group.name}</span>?<br />
            This action can not be undone.
          </>
        }
        header="Delete Group"
        accept={actionDeleteGroup}
        onHide={() => setDeleteDialogVisible(false) }
        visible={deleteDialogVisible}
      />
    </div>
  }

  return (
    <Page windowTitle={groupsRoute.title} className="page-groups" errors={[error]}>
      <HeaderPanel titleText={groupsRoute.title} showSearch searchPlaceHolder='Search by group name...' onSearch={onSearch}>
        <Button label='Create' className='p-button-sm' icon='fa-regular fa-plus' onClick={addGroup} />
      </HeaderPanel>
      <div className="content-wrapper">
        <DataTable lazy value={groupsData?.groups} loading={isLoadingGroups} responsiveLayout="stack" emptyMessage="No groups found">
          <Column style={{ width: "5%" }} field="id" header="ID" />
          <Column style={{ width: "30%" }} field="name" header="Name" />
          <Column
            style={{ width: "60%" }}
            field="description"
            header="Description"
            body={data => wrapLinks(data.description)}
          />
          <Column style={{ width: "5%" }} header="" body={ContextMenu}></Column>
        </DataTable>
      </div>
      <GroupEditor visible={editedGroupVisible} onClose={onEditClose} groupId={editedGroupId} />
    </Page>
  );
}

const groupsRoute: IAppRoute = {
  path: () => AppRoute.Groups,
  page: <Groups />,
  title: "Groups",
  iconClassName: "fa fa-folder-open-o",
  isAdminPage: true,
  isExpertMode: true,
};

export default groupsRoute;