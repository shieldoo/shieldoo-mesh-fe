import { FieldArray, FieldArrayRenderProps, useFormikContext } from "formik";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import { useCallback, useRef, useState } from "react";

import { AccessListener, Server } from "../../../api/generated";
import { resolveAccessRightListenerIcon } from "../../../Common/Utils/AccessRightsUtils";
import { AccessRightListenerType } from "../../../pages/MyAccessRights/MyAccessRightsTypes";
import { useServerData } from "../hooks/useServerData";
import DataTable from "../../DataTable";
import DeleteDialog from "../../DeleteDialog";
import { Ellipsis , EllipsisWithTooltip} from "../../Ellipsis";
import EmptyContent from "../../EmptyContent";
import AttachedServiceEditor from "./AttachedServiceEditor";
import { classNames } from "primereact/utils";

function AttachedServicesTab() {
  const { values } = useFormikContext();
  const listeners = (values as Server)?.access?.listeners || [];

  const [editedListenerIndex, setEditingListenerIndex] = useState<number | undefined>();
  const [editingNewListener, setEditingNewListener] = useState<boolean>(false);
  const [listenerEditorVisible, setListenerEditorVisible] = useState<boolean>(false);

  const serverData = useServerData();

  const onEditClosed = (isCanceled: boolean, helpers: FieldArrayRenderProps): void => {
    if (editingNewListener && isCanceled) {
      helpers.remove(listeners.length - 1);
    }
    setListenerEditorVisible(false);
    setEditingNewListener(false);
    setEditingListenerIndex(undefined);
  };

  const onAddListener = useCallback(
    (helpers: FieldArrayRenderProps) => {
      helpers.push(serverData.getListenerWithDefaults());
      setEditingNewListener(true);
      setEditingListenerIndex(listeners.length);
      setListenerEditorVisible(true);
    },
    // eslint-disable-next-line
    [listeners.length]
  );

  const AddListenerButton = ({ helpers }: { helpers: FieldArrayRenderProps }) => {
    return (
      <Button
        type="button"
        className="mb-5"
        icon="fa-regular fa-plus"
        label="Create"
        onClick={() => onAddListener(helpers)}
      />
    );
  };
  const ListenerIcon = (listener: AccessListener) => {
    const icon = resolveAccessRightListenerIcon(listener.accessListenerType?.glyph as AccessRightListenerType);
    return <i className={classNames('fa', icon)} />;
  };
  function ContextMenu({ helpers, index }: { helpers: FieldArrayRenderProps; index: number }) {
    const popupMenu = useRef<Menu>(null);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState<boolean>(false);

    const menuItems: MenuItem[] = [
      {
        label: "Edit",
        icon: "fa-regular fa-pencil",
        command: () => {
          setEditingListenerIndex(index);
          setEditingNewListener(false);
          setListenerEditorVisible(true);
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
    const actionDeleteListener = async () => {
      helpers.remove(index);
    };
    return (
      <div className="flex">
        <Menu model={menuItems} className="user-dropdown-menu" popup ref={popupMenu} />
        <Button
          type="button"
          className="p-button-link"
          icon="fa-regular fa-ellipsis-v"
          onClick={e => popupMenu.current?.toggle(e)}
        />
        <DeleteDialog
          message="Are you sure you want to delete this attached service?"
          header="Delete Attached Service"
          accept={actionDeleteListener}
          onHide={() => setDeleteDialogVisible(false)}
          visible={deleteDialogVisible}
        />
      </div>
    );
  }

  return (
    <>
      <FieldArray
        name="access.listeners"
        render={arrayHelpers => (
          <>
            {listeners.length > 0 && <AddListenerButton helpers={arrayHelpers} />}
            <DataTable
              value={listeners}
              loading={false}
              responsiveLayout="stack"
              emptyMessage={
                <EmptyContent
                  title="No Attached Services"
                  text=""
                  iconClass="fa-regular fa-eye fa-10x"
                  customContent={<AddListenerButton helpers={arrayHelpers} />}
                />
              }
            >
              <Column
                style={{ width: "5%" }}
                field="accessListenerType.glyph"
                header="Icon"
                body={ListenerIcon}
              ></Column>
              <Column style={{ width: "12%" }} field="listenPort" header="Listen Port"></Column>
              <Column style={{ width: "5%" }} field="protocol" header="Protocol"></Column>
              <Column style={{ width: "14%" }} field="forwardPort" header="Forward Port"></Column>
              <Column style={{ width: "14%" }} field="forwardHost" header="Forward Host" body={(listener) => <EllipsisWithTooltip value={listener.forwardHost || ""} maxWidth={120} />}></Column>
              <Column field="description" header="Description" body={(listener) => <Ellipsis value={listener.description || ""} maxWidth={200} />}></Column>
              <Column
                style={{ width: "5%" }}
                field="action"
                header="Action"
                body={(data: AccessListener, props) => <ContextMenu helpers={arrayHelpers} index={props.rowIndex} />}
              ></Column>
            </DataTable>
            <AttachedServiceEditor
              visible={listenerEditorVisible}
              editingNewListener={editingNewListener}
              index={editedListenerIndex}
              onClose={(keepChanges: boolean) => onEditClosed(keepChanges, arrayHelpers)}
            />
          </>
        )}
      />
    </>
  );
}

export default AttachedServicesTab;
