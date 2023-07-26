import React, { useCallback, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";

import { GetFirewallQuery, useFirewallsQuery, useFirewallDeleteMutation } from "../../../api/generated";
import HeaderPanel from "../../../components/HeaderPanel";
import { useDebounce } from "../../../hooks/useDebounce";
import { RequestError } from "../../../api/graphqlBaseQueryTypes";
import FwConfigEditor from "../../../components/FwConfigEditor";
import Page from "../../../components/Page";
import useToast from "../../../hooks/useToast";
import DeleteDialog from "../../../components/DeleteDialog";
import DataTable from "../../../components/DataTable";
import { AppRoute, IAppRoute } from "../../../AppRoute";

type FwConfig = GetFirewallQuery["firewallConfiguration"];

function Firewalls() {
  const [searchString, setSearchString] = useState("");
  const { debouncedValue: debouncedSearchString } = useDebounce(searchString);
  const [editedFwConfigId, setEditedFwConfigId] = useState<number>(0);
  const [editedFwConfigVisible, setEditedFwConfigVisible] = useState<boolean>(false);
  const { isFetching: isLoading, data: fwconfigData, refetch: refetchFwConfigs, error } = useFirewallsQuery({ name: "%" + debouncedSearchString + "%" });
  const [deleteFirewall] = useFirewallDeleteMutation();
  const toast = useToast();

  const onSearch = useCallback((searchVal: string) => setSearchString(searchVal), [setSearchString]);
  const addFirewall = useCallback(() => {
    setEditedFwConfigVisible(true);
    setEditedFwConfigId(0);
  }, []);

  const onEditClosed = (fwconfig: FwConfig | null): void => {
    if(fwconfig){
      refetchFwConfigs();
    }
    setEditedFwConfigVisible(false);
    setEditedFwConfigId(0);
  };      

  function ContextMenu(fw: FwConfig) {
    const popupMenu = useRef<Menu>(null);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState<boolean>(false);

    const menuItems: MenuItem[] = [
      {
        label: "Edit",
        icon: "fa-regular fa-pencil",
        command: () => {
          setEditedFwConfigId(fw.id);
          setEditedFwConfigVisible(true);
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

    const actionDeleteFirewall = async () => {
      try {
        await deleteFirewall({ id: fw.id }).unwrap();
        refetchFwConfigs();
        toast.show({
          severity: "success",
          detail: `Firewall '${fw.name}' has been deleted successfully`,
          life: 4000,
        });
      } catch (ex) {
        let e = ex as RequestError;
        let emsg = "An unknown error occurred while deleting the firewall";
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
        <DeleteDialog
          message={
            <>
              Are you sure you want to delete firewall <span className="font-bold">{fw.name}</span>?<br />
              This action can not be undone.
            </>
          }
          header="Delete Firewall"
          accept={actionDeleteFirewall}
          onHide={() => setDeleteDialogVisible(false)}
          visible={deleteDialogVisible}
        />
      </div>
    );
  }

  return (
    <Page windowTitle={firewallsRoute.title} className="page-firewalls" errors={[error]}>
      <HeaderPanel titleText={firewallsRoute.title} showSearch searchPlaceHolder="Search by firewall name..." onSearch={onSearch}>
        <Button label="Create" className="p-button-sm" icon="fa-regular fa-plus" onClick={addFirewall} />
      </HeaderPanel>
      <div className="content-wrapper">
        <DataTable lazy value={fwconfigData?.firewallConfigurations} loading={isLoading} responsiveLayout="stack" emptyMessage="No firewalls found">
          <Column style={{ width: "5%" }} field="id" header="ID" />
          <Column style={{ width: "90%" }} field="name" header="Name" />
          <Column style={{ width: "5%" }} header="Action" body={ContextMenu}></Column>
        </DataTable>
      </div>
      <FwConfigEditor visible={editedFwConfigVisible} fwconfigId={editedFwConfigId} onClose={onEditClosed} />

    </Page>
  );
}

const firewallsRoute: IAppRoute = {
  path: () => AppRoute.Firewall,
  page: <Firewalls />,
  title: "Firewall",
  iconClassName: "fa fa-shield",
  isAdminPage: true,
  isExpertMode: true,
};

export default firewallsRoute;
