import React, { useCallback, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";

import { UserAccessTemplate, useUserAccessTemplateDeleteMutation, useUserAccessTemplatesQuery } from "../../../api/generated";
import HeaderPanel from "../../../components/HeaderPanel";
import { useDebounce } from "../../../hooks/useDebounce";
import { RequestError } from "../../../api/graphqlBaseQueryTypes";
import Page from "../../../components/Page";
import useToast from "../../../hooks/useToast";
import UserAccessTemplateEditor from "./UserAccessTemplateEditor";
import { useSelector } from "react-redux";
import { selectors } from "../../../ducks/auth";
import DateFormat from "../../../Common/Utils/DateFormat";
import DataTable from "../../../components/DataTable";
import { wrapLinks } from "../../../Common/Utils/ParseUtils";
import DeleteDialog from "../../../components/DeleteDialog";
import { AppRoute, IAppRoute } from "../../../AppRoute";

function UserAccessTemplates() {
  const [searchString, setSearchString] = useState("");
  const [editedAccessId, setEditedAccessId] = useState<number>(0);
  const [editedAccessVisible, setEditedAccessVisible] = useState<boolean>(false);
  const { debouncedValue: debouncedSearchString } = useDebounce(searchString);
  const { isFetching: isLoadingAccesss, data: AccessesData, refetch: refetchAccesses } = useUserAccessTemplatesQuery({ name: "%" + debouncedSearchString + "%" });
  const [deleteAccess] = useUserAccessTemplateDeleteMutation();
  const toast = useToast();
  const config = useSelector(selectors.selectUiConfig);

  const onSearch = useCallback((searchVal: string) => setSearchString(searchVal), [setSearchString]);
  const addAccess = useCallback(() => {
    setEditedAccessVisible(true);
    setEditedAccessId(0);
  }, []);
  const onEditClose = (accessid: number | null): void => {
    if (accessid) {
      refetchAccesses();
    }
    setEditedAccessVisible(false);
    setEditedAccessId(0);
  };

  function ContextMenu(access: UserAccessTemplate) {
    const popupMenu = useRef<Menu>(null);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState<boolean>(false);

    const menuItems: MenuItem[] = [
      {
        label: "Edit",
        icon: "fa-regular fa-pencil",
        command: () => {
          setEditedAccessId(access.id);
          setEditedAccessVisible(true);
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
        await deleteAccess({ userAccessTemplateDeleteId: access.id }).unwrap();
        refetchAccesses();
        toast.show({
          severity: "success",
          detail: `The access card template '${access.name}' has been deleted successfully`,
          life: 4000,
        });
      } catch (ex) {
        let e = ex as RequestError;
        let emsg = "An unknown error occurred while deleting the access card template";
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
        <Menu model={menuItems} className="useraccesstemplate-dropdown-menu" popup ref={popupMenu} />
        <Button className="p-button-link" icon="fa-regular fa-ellipsis-v" onClick={(e) => popupMenu.current?.toggle(e)} />
        <DeleteDialog
          message={
            <>
              Are you sure you want to delete access card template <span className="font-bold">{access.name}</span>?<br />
              This action can not be undone.
            </>
          }
          header="Delete Access Card Template"
          accept={actionDeleteAccess}
          onHide={() => setDeleteDialogVisible(false)}
          visible={deleteDialogVisible}
        />
      </div>
    );
  }

  function FormatValidToDate(d: UserAccessTemplate) {
    let ret;
    if (d.validTo >= config?.maxCertificateValidity) {
      ret = "Max (" + DateFormat.toReadableString(d.validTo) + ")";
    } else {
      ret = DateFormat.toReadableString(d.validTo);
    }
    return ret;
  }

  return (
    <Page windowTitle={userAccessTemplatesRoute.title} className="page-useraccesstemplates">
      <HeaderPanel titleText="Access Card Templates" showSearch searchPlaceHolder="Search by access card name..." onSearch={onSearch}>
        <Button label="Create" className="p-button-sm" icon="fa-regular fa-plus" onClick={addAccess} />
      </HeaderPanel>
      <div className="content-wrapper">
        <DataTable lazy value={AccessesData?.userAccessTemplates} loading={isLoadingAccesss} responsiveLayout="stack" emptyMessage="No access card templates found">
          <Column style={{ width: "5%" }} field="id" header="ID" />
          <Column style={{ width: "20%" }} field="name" header="Name" />
          <Column
            style={{ width: "50%" }}
            field="description"
            header="Description"
            className="cut-text"
            body={data => wrapLinks(data.description)}
          />
          <Column style={{ width: "20%" }} field="validTo" header="Valid Till" body={FormatValidToDate} />
          <Column style={{ width: "5%" }} header="" body={ContextMenu}></Column>
        </DataTable>
      </div>
      <UserAccessTemplateEditor accessId={editedAccessId} visible={editedAccessVisible} onClose={onEditClose} />
    </Page>
  );
}

const userAccessTemplatesRoute: IAppRoute = {
  path: () => AppRoute.UserAccessTemplates,
  page: <UserAccessTemplates />,
  title: "Access Card Templates",
  iconClassName: "fa fa-list-alt",
  isAdminPage: true,
  isExpertMode: true,
};

export default userAccessTemplatesRoute;
