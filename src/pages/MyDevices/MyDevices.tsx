import { Column } from "primereact/column";
import { Menu } from "primereact/menu";
import { Button } from "primereact/button";
import { MenuItem } from "primereact/menuitem";
import { useRef, useState } from "react";

import { Access, useMeQuery, useUserDeviceDeleteMutation, useUserDeviceSaveNoteMutation } from "../../api/generated";
import HeaderPanel from "../../components/HeaderPanel";
import Page from "../../components/Page";
import { resolveDeviceTypeIcon, resolveDeviceTypeName } from "./MyDevicesUtils";
import DataTable from "../../components/DataTable";
import { AppRoute, IAppRoute } from "../../AppRoute";
import DateFormat from "../../Common/Utils/DateFormat";
import DeleteDialog from "../../components/DeleteDialog";
import useToast from "../../hooks/useToast";
import { RequestError } from "../../api/graphqlBaseQueryTypes";
import MyDeviceEditNote from "./MyDeviceEditNote";
import { DeviceSaveNote } from "./MyDeviceTypes";
import { wrapLinks } from "../../Common/Utils/ParseUtils";
import { classNames } from "primereact/utils";

function MyDevices(): JSX.Element {
  const { isFetching: isFetchingAccessDevices, data: meData, refetch: refetchData, error } = useMeQuery({});
  const [editNoteVisible, setEditNoteVisible] = useState<boolean>(false);
  const [editNote, setEditNote] = useState<DeviceSaveNote | null>(null);
  const [deleteDevice] = useUserDeviceDeleteMutation();
  const [saveNote] = useUserDeviceSaveNoteMutation();
  const toast = useToast();

  function ContextMenu(acc: Access) {
    const popupMenu = useRef<Menu>(null);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState<boolean>(false);

    console.log("ContextMenu", acc);

    const menuItems: MenuItem[] = [
      {
        label: "Edit note",
        icon: "fa-regular fa-pencil",
        command: () => {
          setEditNote({ accessID: acc.id, note: acc.description || "" });
          setEditNoteVisible(true);
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
    const actionDelete = async () => {
      try {
        await deleteDevice({ id: acc.id }).unwrap();
        refetchData();
        toast.show({
          severity: "success",
          detail: `The device '${acc.deviceInfo?.name}' has been deleted successfully.`,
          life: 4000,
        });
      } catch (ex) {
        let e = ex as RequestError;
        let emsg = "An unknown error occurred while deleting the device";
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
        <Button className="p-button-link" icon="fa-regular fa-ellipsis-v" onClick={e => popupMenu.current?.toggle(e)} />
        <DeleteDialog
          message={
            <>
              Are you sure you want to delete device <span className="font-bold">{acc.deviceInfo?.name}</span>?<br />
              This action can not be undone.
            </>
          }
          header="Delete Device"
          accept={actionDelete}
          onHide={() => setDeleteDialogVisible(false)}
          visible={deleteDialogVisible}
        />
      </div>
    );
  }

  const actionSaveNote = async (data: DeviceSaveNote) => {
    try {
      await saveNote({ id: data.accessID, note: data.note }).unwrap();
      refetchData();
      toast.show({
        severity: "success",
        detail: `The note for device has been updated successfully.`,
        life: 4000,
      });
    } catch (ex) {
      let e = ex as RequestError;
      let emsg = "An unknown error occurred while updating note for device";
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

  const noteEditOnClose = (data: DeviceSaveNote | null) => {
    if (data) {
      actionSaveNote(data);
    }
    setEditNoteVisible(false);
    setEditNote(null);
  };

  return (
    <Page windowTitle={myDevicesRoute.title} errors={[error]} className="page-mydevices">
      <HeaderPanel titleText={myDevicesRoute.title} />
      <div className="content-wrapper">
        {meData?.me.userAccesses?.map(access => (
          <div key={access.name}>
            <h2 style={{ textAlign: "left", fontSize: 16 }}>
              <div style={{ fontSize: 12 }}>Access card</div>
              <i className="fa fa-lg fa-id-card-o" />
              <span style={{ marginLeft: 8 }}>{access.name}</span>
            </h2>
            <DataTable
              className="user-list-table"
              lazy
              value={access.accesses ? access.accesses : []}
              responsiveLayout="stack"
              loading={isFetchingAccessDevices}
              emptyMessage="No devices found"
            >
              <Column
                style={{ width: "15%" }}
                header="Device"
                body={(data: Access) => (
                  <>
                    <span>
                      <i className={classNames('fa', 'fa-lg', resolveDeviceTypeIcon(data.deviceInfo?.deviceOSType || ""))} />
                    </span>
                    <span style={{ marginLeft: 8 }}>{resolveDeviceTypeName(data.deviceInfo?.deviceOSType || "")}</span>
                  </>
                )}
              ></Column>
              <Column style={{ width: "20%" }} field="deviceInfo.name" header="Hostname"></Column>
              <Column
                style={{ width: "20%" }}
                field=""
                header="Last seen"
                body={(data: Access) => <span>{DateFormat.toReadableString(data.statistics?.lastContact)}</span>}
              ></Column>
              <Column style={{ width: "15%" }} field="ipAddress" header="IPv4 Address"></Column>
              <Column
                style={{ width: "25%" }}
                field="description"
                header="Note"
                className="cut-text"
                body={data => wrapLinks(data.description)}
              ></Column>
              <Column style={{ width: "5%" }} header="" body={ContextMenu}></Column>
            </DataTable>{" "}
          </div>
        ))}{" "}
      </div>
      <MyDeviceEditNote visible={editNoteVisible} data={editNote} onClose={noteEditOnClose} />
    </Page>
  );
}

const myDevicesRoute: IAppRoute = {
  path: () => AppRoute.Devices,
  page: <MyDevices />,
  title: "My Devices",
  iconClassName: "fa-regular fa-desktop",
};

export default myDevicesRoute;
