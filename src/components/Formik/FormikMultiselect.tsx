import { FieldHookConfig, useField } from "formik";
import { MultiSelect, MultiSelectProps } from "primereact/multiselect";
import { classNames } from "primereact/utils";

const FormikMultiSelect = ({ label, ...defaultProps }: any) => {
  const [field, meta] = useField(defaultProps as FieldHookConfig<MultiSelectProps>);
  const shouldDisplayError: boolean = meta.error && meta.touched ? true : false;

  return (
    <div className="field">
      <label htmlFor={field.name}>{label}</label>
      <MultiSelect
        id={defaultProps.id || defaultProps.name}
        inputId={defaultProps.id || defaultProps.name}
        {...field}
        {...defaultProps}
        className={classNames("w-full", { "p-multiselect-error": shouldDisplayError })}
      />
      {shouldDisplayError && <small className="p-error">{meta.error}</small>}
    </div>
  );
};

export default FormikMultiSelect;
