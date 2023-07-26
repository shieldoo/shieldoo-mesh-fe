import { FieldHookConfig, useField } from "formik";
import { RadioButton, RadioButtonProps } from "primereact/radiobutton";
import { classNames } from "primereact/utils";

import WithTooltip from "../WithTooltip";

const FormikRadioButton = ({ label, showError = true, ...defaultProps }: any) => {
  const [field, meta] = useField(defaultProps as FieldHookConfig<RadioButtonProps>);
  const shouldDisplayError: boolean = meta.error && meta.touched  ? true : false;

  return (
    <div className="field-radio-button field">
      <WithTooltip tooltip={defaultProps["data-tooltip"]} tooltipPosition="top">
        <div className="field-radio-button">
          <RadioButton
            id={defaultProps.id || defaultProps.name}
            inputId={defaultProps.id || defaultProps.name}
            checked={field.value}
            {...field}
            {...defaultProps}
            className={classNames({ "p-invalid": shouldDisplayError })}
          />
          <label htmlFor={field.name}>{label}</label>
        </div>
      </WithTooltip>
      {showError && shouldDisplayError && <small className="p-error">{meta.error}</small>}
    </div>
  );
};

export default FormikRadioButton;
