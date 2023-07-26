import { FieldHookConfig, useField } from "formik";
import { InputTextarea, InputTextareaProps } from "primereact/inputtextarea";
import { classNames } from "primereact/utils";

import WithTooltip from "../WithTooltip";

const FormikInputTextArea = ({ label, ...defaultProps }: any) => {
  const [field, meta] = useField(defaultProps as FieldHookConfig<InputTextareaProps>);
  const shouldDisplayError: boolean = meta.error && meta.touched  ? true : false;

  return (
    <div className="field">
      <label htmlFor={field.name}>{label}</label>
      <WithTooltip className="w-6" tooltip={defaultProps["data-tooltip"]} tooltipPosition="top">
        <InputTextarea
          id={defaultProps.id || defaultProps.name}
          {...field}
          {...defaultProps}
          className={classNames("w-full", { "p-invalid": shouldDisplayError })}
        />
      </WithTooltip>
      {shouldDisplayError && <small className="p-error">{meta.error}</small>}
    </div>
  );
};

export default FormikInputTextArea;
