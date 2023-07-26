import { FieldHookConfig, useField } from "formik";
import { Checkbox, CheckboxProps } from "primereact/checkbox";
import { classNames } from "primereact/utils";

import WithTooltip from "../WithTooltip";

const FormikCheckbox = ({ label, ...defaultProps }: any) => {
  const [field, meta] = useField(defaultProps as FieldHookConfig<CheckboxProps>);
  const shouldDisplayError: boolean = meta.error && meta.touched  ? true : false;

  return (
    <div className="field-checkbox field">
      <WithTooltip tooltip={defaultProps["data-tooltip"]} tooltipPosition="top">
        <div className="field-checkbox-content">
          <Checkbox
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
      {shouldDisplayError && <small className="p-error">{meta.error}</small>}
    </div>
  );
};

export default FormikCheckbox;
