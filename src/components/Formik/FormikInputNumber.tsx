import { FieldHookConfig, useField, useFormikContext } from "formik";
import { InputNumber, InputNumberProps } from "primereact/inputnumber";
import { classNames } from "primereact/utils";

import WithTooltip from "../WithTooltip";

const FormikInputNumber = ({ label, ...defaultProps }: any) => {
  const [field, meta] = useField(defaultProps as FieldHookConfig<InputNumberProps>);
  const { setFieldValue } = useFormikContext();
  const shouldDisplayError: boolean = meta.error && meta.touched ? true : false;

  return (
    <div className="field">
      <label htmlFor={field.name}>{label}</label>
      <WithTooltip className="w-6" tooltip={defaultProps["data-tooltip"]} tooltipPosition="top">
        <InputNumber
          id={defaultProps.id || defaultProps.name}
          format={false}
          {...field}
          {...defaultProps}
          onChange={values => {
            values && values.value && setFieldValue(defaultProps.name, values.value);
          }}
          className="w-full"
          inputClassName={classNames({ "p-invalid": shouldDisplayError })}
        />
      </WithTooltip>
      {shouldDisplayError && <small className="p-error">{meta.error}</small>}
    </div>
  );
};

export default FormikInputNumber;
