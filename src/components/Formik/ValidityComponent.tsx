import { useField } from "formik";
import { Calendar } from "primereact/calendar";
import { classNames } from "primereact/utils";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import DateFormat from "../../Common/Utils/DateFormat";
import { selectors } from "../../ducks/auth";
import FormikRadioButton from "./FormikRadioButton";

const ValidityComponent = () => {
  const [field, meta, helpers] = useField("access.validTo");

  const shouldDisplayError: boolean = meta.error ? true : false;

  const config = useSelector(selectors.selectUiConfig);

  const currentUnixEpoch = Math.floor(new Date(field.value).getTime() / 1000.0);
  const maximumUnixEpoch = Math.floor(new Date(config?.maxCertificateValidity).getTime() / 1000.0);
  const [lifetime, setLifetime] = useState(maximumUnixEpoch === currentUnixEpoch);

  useEffect(() => {
    if (field.value === undefined) {
      helpers.setValue(config?.maxCertificateValidity);
      setLifetime(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="field">
      <label htmlFor="access.validTo">Valid Till</label>

      <FormikRadioButton
        label={`Subscription lifetime (${DateFormat.toReadableString(config?.maxCertificateValidity)})`}
        id="max"
        inputId="max"
        name="access.validTo"
        checked={lifetime}
        onChange={() => {
          setLifetime(true);
          helpers.setValue(new Date(config?.maxCertificateValidity));
        }}
        showError={false}
      />

      <FormikRadioButton
        label="Custom expiration date"
        id="custom"
        inputId="custom"
        name="access.validTo"
        onChange={() => {
          setLifetime(false);
        }}
        checked={!lifetime}
        showError={false}
      />

      {!lifetime && (
        <div className="field">
          <Calendar
            id="access.validTo"
            name="access.validTo"
            showIcon
            showTime
            dateFormat="yy-mm-dd"
            value={new Date(field.value)}
            onChange={e => {
              e.value && helpers.setValue(new Date(e.value.toString()));
            }}
            className={classNames({ "p-invalid": shouldDisplayError })}
          />
          {shouldDisplayError && (
            <>
              <br />
              <small className="p-error">{meta.error}</small>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ValidityComponent;
