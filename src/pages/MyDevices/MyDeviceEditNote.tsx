import { useFormik } from "formik";
import SidePanel from "../../components/SidePanel";
import { useCallback, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { DeviceSaveNote } from "./MyDeviceTypes";

type MyDeviceEditNoteProps = {
  visible: boolean;
  data: DeviceSaveNote | null;
  onClose: (data: DeviceSaveNote | null) => void;
};

function MyDeviceEditNote(props: MyDeviceEditNoteProps) {
  const formik = useFormik({
    initialValues: {
      description: "",
    },
    onSubmit: async data => {
      props.onClose({ accessID: props.data?.accessID || 0, note: data.description });
    },
  });

  useEffect(
    () => {
      if (props.data && props.visible) {
        formik.setValues({ description: props.data.note });
      } else {
        formik.resetForm();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props]
  );

  const onSave = useCallback(() => formik.submitForm(), [formik]);
  const onCancel = useCallback(() => {
    props.onClose(null);
  }, [props]);

  return (
    <>
      <SidePanel title="Edit note for my device" visible={props.visible} onClose={onCancel}>
        <>
          <div className="side-panel-content side-panel-content-section">
            <form onSubmit={formik.handleSubmit}>
              <div className="field">
                <label htmlFor="group-description">Description</label>
                <InputText
                  id="description"
                  name="description"
                  value={formik.values.description}
                  className="w-full"
                  onChange={formik.handleChange}
                />
              </div>
            </form>
          </div>
          <div className="side-panel-controls">
            <Button label="Save" className="p-button-sm" icon={"fa-regular fa-save"} onClick={onSave} />
            <Button label="Cancel" className="p-button-sm p-button-text p-button-secondary" onClick={onCancel} />
          </div>
        </>
      </SidePanel>
    </>
  );
}

export default MyDeviceEditNote;
