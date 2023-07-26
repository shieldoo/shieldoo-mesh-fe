import { useField } from "formik";
import FormikCheckbox from "../../Formik/FormikCheckbox";
import FormikDropdown from "../../Formik/FormikDropdown";
import FormikInputText from "../../Formik/FormikInputText";
import FormikInputTextArea from "../../Formik/FormikInputTextArea";

function GeneralTab() {
  const [field] = useField("serverOSAutoUpdatePolicy.osAutoUpdateEnabled");

  // generate options for OS auto update hours, first is 0 (Anytime) and rest is 1-23
  const osAutoUpdateHoursOptions = Array.from(Array(24).keys()).map((item) => ({
    label: item === 0 ? "Anytime" : item.toString(),
    value: item,
  }));

  return (
    <>
      <FormikInputText label="Name" name="name" data-tooltip={"Defines a custom name for your server"} />
      <FormikInputTextArea label="Note" name="description" rows={8} data-tooltip="Defines a custom description of your server" />
      <FormikCheckbox
        label="Automatic shieldoo update"
        name="allowAutoUpdate"
        data-tooltip="Enables automatic server side application updates to latest version."
      />
      <hr></hr>
      <FormikCheckbox
        label="Automatic OS updates"
        name="serverOSAutoUpdatePolicy.osAutoUpdateEnabled"
        data-tooltip="Enables automatic updates on OS level (this option will start collect data about updates)."
      />
      {field.value && (
        <>
          <FormikCheckbox
            label="Apply security OS updates"
            name="serverOSAutoUpdatePolicy.securityAutoUpdateEnabled"
            data-tooltip="Enables security automatic updates on OS level (will be applied)."
          />
          <FormikCheckbox
            label="Apply all OS updates"
            name="serverOSAutoUpdatePolicy.allAutoUpdateEnabled"
            data-tooltip="Enables all automatic updates on OS level (will be applied)."
          />
          <FormikCheckbox
            label="Restart machine when OS updates were applied"
            name="serverOSAutoUpdatePolicy.restartAfterUpdate"
            data-tooltip="Restart machine when OS updates were installed to apply specific changes required by OS update process."
          />
          <FormikDropdown
            label="Select hour in dy (GMT time) to apply updates"
            name="serverOSAutoUpdatePolicy.osAutoUpdateHour"
            data-tooltip="Select hour in day (GMT time) when OS updates will be applied to avoid disturbing your users."
            options={osAutoUpdateHoursOptions}
          />
      </>
      )}
    </>
  );
}

export default GeneralTab;
