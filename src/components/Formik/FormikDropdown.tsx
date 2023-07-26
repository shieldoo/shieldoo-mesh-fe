import { FieldHookConfig, useField } from "formik";
import { Dropdown, DropdownProps } from "primereact/dropdown";
import { classNames } from "primereact/utils";
import { useEffect } from "react";

const FormikDropdown = ({ label, ...defaultProps }: any) => {
  const [field, meta, helpers] = useField(defaultProps as FieldHookConfig<DropdownProps>);
  const shouldDisplayError: boolean = meta.error && meta.touched ? true : false;

  useEffect(() => {
    if (meta.error) {
      meta.touched = true;
      helpers.setTouched(true);
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div className="field">
      <label htmlFor={field.name}>{label}</label>
      <Dropdown
        id={defaultProps.id || defaultProps.name}
        inputId={defaultProps.id || defaultProps.name}
        {...field}
        {...defaultProps}
        className={classNames("w-full", { "p-invalid": shouldDisplayError })}
      />
      {shouldDisplayError && <small className="p-error">{meta.error}</small>}
    </div>
  );
};

export default FormikDropdown;
