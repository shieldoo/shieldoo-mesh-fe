import FormikCheckbox from "../../Formik/FormikCheckbox";
import FormikInputText from "../../Formik/FormikInputText";
import FormikInputTextArea from "../../Formik/FormikInputTextArea";

const BasicForm = () => {
  return (
    <div className="side-panel-content-section">
      <FormikInputText label="Name" name="name" />
      <FormikInputTextArea label="Note" name="description" rows={8} />
      <FormikCheckbox
        label="Automatic update"
        name="allowAutoUpdate"
        data-tooltip="Enables automatic server side application updates to latest version."
      />
    </div>
  );
};

export default BasicForm;
