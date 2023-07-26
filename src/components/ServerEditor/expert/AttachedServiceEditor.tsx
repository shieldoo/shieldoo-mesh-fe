import { useFormikContext } from "formik";
import { Button } from "primereact/button";
import { classNames } from "primereact/utils";
import { useCallback } from "react";

import SidePanel from "../../SidePanel";
import FormikInputText from "../../Formik/FormikInputText";
import FormikInputNumber from "../../Formik/FormikInputNumber";
import FormikDropdown from "../../Formik/FormikDropdown";
import { resolveAccessRightListenerIcon } from "../../../Common/Utils/AccessRightsUtils";
import FormikInputTextArea from "../../Formik/FormikInputTextArea";

type Props = {
  visible: boolean;
  editingNewListener: boolean;
  index: number | undefined;
  onClose: (isCanceled: boolean) => void;
};

function AttachedServiceEditor(props: Props) {
  const { validateForm, getFieldHelpers } = useFormikContext();

  const path = `access.listeners[${props.index}]`;

  const optionsType = [
    { id: 0, label: "Server", glyph: "server" },
    { id: 1, label: "Printer", glyph: "printer" },
    { id: 2, label: "NAS", glyph: "nas" },
    { id: 3, label: "Other", glyph: "other" },
  ];
  const optionsProtocol = [
    { label: "TCP", value: "tcp" },
    { label: "UDP", value: "udp" },
  ];

  const onCancel = useCallback(() => {
    props.onClose(true);
  }, [props]);
  const onSave = useCallback(() => {
    validateForm()
      .then((errors: any) => {
        if (errors.access?.listeners) {
          errors.access.listeners.forEach((element: any) => {
            if (element !== undefined) {
              const keys = Object.keys(element);
              keys.forEach(key => {
                const field = getFieldHelpers(`${path}.${key}`);
                field.setTouched(true);
              });
            }
          });
        } else {
          props.onClose(false);
        }
      })
      .catch(e => {
        // console.log("error: ", e);
      });
    // eslint-disable-next-line
  }, [props, path, validateForm]);

  const itemTemplate = (option: any) => {
    return (
      <div className="flex align-items-center gap-3">
        <i className={classNames('fa', resolveAccessRightListenerIcon(option.glyph))} />
        <div>{option.label}</div>
      </div>
    );
  };

  return (
    <SidePanel
      title={`${props.editingNewListener ? "Create" : "Edit"} Attached Service`}
      onClose={onCancel}
      visible={props.visible}
      size="x-small"
    >
      {props.visible && (
        <>
          <div className="side-panel-content side-panel-content-section">
            <FormikDropdown
              label="Type"
              name={`${path}.accessListenerType.id`}
              placeholder="Select type"
              options={optionsType}
              optionLabel="label"
              optionValue="id"
              itemTemplate={itemTemplate}
              onChange={(e: any) => {
                const field = getFieldHelpers(`${path}.accessListenerType`);
                field.setValue({
                  id: e.value,
                  glyph: optionsType[e.value].glyph,
                  name: optionsType[e.value].label,
                });
              }}
            />
            <FormikInputNumber
              label="Listen port"
              name={`${path}.listenPort`}
              showButtons
              mode="decimal"
              inputId={`${path}.listenPort`}
            />
            <FormikDropdown
              label="Protocol"
              name={`${path}.protocol`}
              placeholder="Select protocol"
              options={optionsProtocol}
              optionLabel="label"
              optionValue="value"
            />
            <FormikInputNumber
              label="Forward port"
              name={`${path}.forwardPort`}
              showButtons
              mode="decimal"
              inputId={`${path}.forwardPort`}
            />
            <FormikInputText label="Forward host" name={`${path}.forwardHost`} />
            <FormikInputTextArea label="Description" name={`${path}.description`} rows={4} />
          </div>
          <div className="side-panel-controls">
            <Button
              type="button"
              label={props.editingNewListener ? "Create" : "Save"}
              icon={props.editingNewListener ? "fa-regular fa-plus" : "fa-regular fa-save"}
              className="p-button-sm"
              onClick={onSave}
            />
            <Button
              type="button"
              label="Cancel"
              className="p-button-sm p-button-secondary"
              onClick={onCancel}
            />
          </div>
        </>
      )}
    </SidePanel>
  );
}

export default AttachedServiceEditor;
