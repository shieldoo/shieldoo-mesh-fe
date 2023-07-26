import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import { RadioButton } from "primereact/radiobutton";
import { classNames } from "primereact/utils";
import { useEffect, useState } from "react";
import { useCodeListFirewallsQuery, useCodeListGroupsQuery, useConfigQuery } from "../../api/generated";
import DateFormat from "../../Common/Utils/DateFormat";
import { cannotBeEmpty } from "../../Common/Constants/validationMessages";

export type AccessAttributes = {
  name: string;
  firewallid: number;
  groups: Array<string>;
  validto: string;
  validtotype: string;
};

type AccessInputsProps = {
  visible: boolean;
  disabled: boolean;
  showName: boolean;
  values: AccessAttributes | undefined;
  onChange?: (values: AccessAttributes) => void;
  onValidate?: (isvalid: boolean) => void;
};

function AccessInputs(props: AccessInputsProps) {
  const [valuesData, setValuesData] = useState<AccessAttributes>({ name: "", firewallid: 0, groups: [], validto: "", validtotype: "" });
  const [errorMap, setErrorMap] = useState<{ [key: string]: string }>({});
  const [optionsGroup, setOptionsGroup] = useState<string[]>([]);
  const { data: cfg } = useConfigQuery();
  const { data: optFwConfigs } = useCodeListFirewallsQuery();
  const { data: optGroups } = useCodeListGroupsQuery();

  useEffect(() => {
    if (props.visible && props.values !== undefined) {
      setValuesData(props.values);
    } else {
      const validTo = new Date();
      validTo.setMonth(validTo.getMonth() + 1);
      setValuesData({ name: "", firewallid: 0, groups: [], validto: DateFormat.toReadableString(validTo).substring(0, 10) + " 00:00", validtotype: "max" });
    }
  }, [props.values, props.visible]);

  useEffect(() => {
    setOptionsGroup(optGroups?.codelistGroups?.map((g) => g.name) || []);
  }, [optGroups]);

  const isFieldInvalid = (field: string) => {
    return errorMap[field] !== undefined && errorMap[field] !== "";
  };
  const getFormErrorMessage = (field: string) => {
    return isFieldInvalid(field) && <small className="p-error">{errorMap[field]}</small>;
  };

  useEffect(
    () => {
      let errs = { ...errorMap };
      if (valuesData.name === "" && props.showName) {
        errs.name = cannotBeEmpty;
      } else {
        errs.name = "";
      }
      if (valuesData.firewallid === 0) {
        errs.firewallid = cannotBeEmpty;
      } else {
        errs.firewallid = "";
      }
      if (valuesData.validtotype === "custom") {
        errs.validto = "";
        if (valuesData.validto === "") {
          errs.validto = cannotBeEmpty;
        } else {
          const date = new Date(valuesData.validto);
          if (isNaN(date.getTime())) {
            errs.validto = "Invalid date format. Use the following format: YYYY-MM-DD HH:MM.";
          } else {
            if (date.getTime() < new Date().getTime()) {
              errs.validto = "The value must be a future date.";
            }
            if (date.getTime() > new Date(cfg?.config?.maxCertificateValidity).getTime()) {
              errs.validto = "The maximum allowed date is " + DateFormat.toReadableString(cfg?.config?.maxCertificateValidity) + ".";
            }
          }
        }
      } else {
        errs.validto = "";
      }
      setErrorMap(errs);
      if (props.onValidate !== undefined) {
        props.onValidate(errs.name === "" && errs.firewallid === "" && errs.validto === "");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [valuesData, props.visible, props.showName, props, cfg?.config?.maxCertificateValidity]
  );

  const handleChange = (event: any) => {
    let newValues = { ...valuesData };
    switch (event.target.name) {
      case "name":
        newValues.name = event.target.value;
        break;
      case "firewallid":
        newValues.firewallid = event.target.value;
        break;
      case "groups":
        newValues.groups = event.target.value;
        break;
      case "validto":
        newValues.validto = event.target.value;
        break;
      case "validtotype":
        newValues.validtotype = event.target.value;
        break;
      default:
        break;
    }
    setValuesData(newValues);
    if (props.onChange !== undefined) {
      props.onChange(newValues);
    }
  };

  return (
    <>
      {props.showName && (
        <div className="field">
          <label htmlFor="name">Name</label>
          <InputText disabled={props.disabled} id="name" name="name" value={valuesData.name} className={classNames("w-full", { "p-invalid": isFieldInvalid("name") })} onChange={handleChange} />
          {getFormErrorMessage("name")}
        </div>
      )}
      <div className="field">
        <label htmlFor="firewallid">Firewall configuration</label>
        <Dropdown disabled={props.disabled} id="firewallid" name="firewallid" value={valuesData.firewallid} placeholder="Select firewall" className={classNames("w-full", { "p-invalid": isFieldInvalid("firewallid") })} onChange={handleChange} options={optFwConfigs?.codelistFirewalls} optionLabel="name" optionValue="id" />
        {getFormErrorMessage("firewallid")}
      </div>
      <div className="field">
        <label htmlFor="groups">Groups</label>
        <MultiSelect disabled={props.disabled} id="groups" display="chip" name="groups" value={valuesData.groups} options={optionsGroup} className={classNames("w-full")} onChange={handleChange} />
      </div>
      <div className="field">
        <label htmlFor="validtotype">Valid till</label>
        <div className="field-radiobutton">
          <RadioButton inputId="validto0" disabled={props.disabled} value="max" name="validtotype" onChange={handleChange} checked={valuesData.validtotype === "max"} />
          <label htmlFor="validto0">Subscription lifetime ({DateFormat.toReadableString(cfg?.config?.maxCertificateValidity)}) </label>
        </div>
        <div className="field-radiobutton">
          <RadioButton inputId="validto1" disabled={props.disabled} value="custom" name="validtotype" onChange={handleChange} checked={valuesData.validtotype === "custom"} />
          <label htmlFor="validto1">Custom length</label>
        </div>
      </div>
      {valuesData.validtotype === "custom" && (
        <div className="field">
          <Calendar disabled={props.disabled} id="validto" name="validto" value={new Date(valuesData.validto)} onChange={handleChange} className={classNames("w-full", { "p-invalid": isFieldInvalid("validto") })} showIcon showTime dateFormat="yy-mm-dd" />
          {getFormErrorMessage("validto")}
        </div>
      )}
    </>
  );
}

export default AccessInputs;
