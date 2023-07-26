import React, { useState, useEffect, useCallback } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { RadioButton } from "primereact/radiobutton";
import { MultiSelect } from "primereact/multiselect";
import { classNames } from "primereact/utils";
import { FormikErrors, useFormik } from "formik";
import SidePanel from "../SidePanel";

import { FwConfigRule, CodeListItem, useLazyCodeListGroupsQuery } from "../../api/generated";
import useToast from "../../hooks/useToast";
import WithTooltip from "../WithTooltip";

type FwConfigRuleDialogProps = {
  visible: boolean;
  isNew: boolean;
  fwconfigRule: FwConfigRule | null | undefined;
  onClose: (fwconfig: FwConfigRule | null) => void;
};

function FwConfigRuleDialog(props: FwConfigRuleDialogProps) {
  const [optionsGroup, setOptionsGroup] = useState<CodeListItem[] | undefined>(undefined);
  const [getGroups] = useLazyCodeListGroupsQuery();
  const toast = useToast();

  const fwFormRule = useFormik({
    initialValues: {
      protocol: "",
      port: "",
      host: "",
      groups: new Array<string>(),
    },
    validate: (data) => {
      let errors: FormikErrors<{ port: string }> = {};

      if (!data.port) {
        errors.port = "Port is required";
      } else if (!/^(any|([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])|(([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])-([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])))$/i.test(data.port)) {
        errors.port = "The value must either be a single number from the standard port range (1-65535), a port range (e.g. 80-90), or 'any'.";
      }

      return errors;
    },
    onSubmit: async (data) => {
      let rule: FwConfigRule = {
        proto: data.protocol,
        port: data.port,
        host: data.host,
      };
      if (data.host === "group") {
        rule.groups = data.groups.map((g) => {
          return {
            name: g,
            id: optionsGroup?.find((go) => go.name === g)?.id || 0,
          };
        });
      }
      props.onClose(rule);
    },
  });

  useEffect(() => {
    const fetcData = async () => {
      const data = await getGroups().unwrap();
      setOptionsGroup(data.codelistGroups);
    };

    if (optionsGroup === undefined) {
      fetcData().catch(() => {
        toast.show({
          severity: "error",
          detail: "An unknown error occurred while loading the groups",
          life: 4000,
        });
      });
    }
  }, [getGroups, optionsGroup, toast]);

  useEffect(
    () => {
      if (props.fwconfigRule) {
        fwFormRule.setValues({
          protocol: props.fwconfigRule.proto || "",
          port: props.fwconfigRule.port || "",
          host: props.fwconfigRule.host || "",
          groups: props.fwconfigRule?.groups?.map((g) => g.name) || new Array<string>(),
        });
      } else {
        fwFormRule.resetForm();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.fwconfigRule]
  );

  const optionsProtocol = [
    {label: "any", value: "any"},
    {label: "TCP", value: "tcp"},
    {label: "UDP", value: "udp"},
    {label: "ICMP", value: "icmp"},
  ];
  const optionsHost = [
    {value: "any", label: "Any group"},
    {value: "group", label: "Specific groups"}
  ];

  const isFieldInvalidRule = (name: "protocol" | "port") => !!(fwFormRule.touched[name] && fwFormRule.errors[name]);
  const getFormErrorMessageRule = (name: "protocol" | "port") => {
    return isFieldInvalidRule(name) && <small className="p-error">{fwFormRule.errors[name]}</small>;
  };
  const onSaveRule = useCallback(() => fwFormRule.submitForm(), [fwFormRule]);
  const onCancelRule = useCallback(() => {
    props.onClose(null);
  }, [props]);

  return (
    <SidePanel title={props.isNew ? "Create Rule" : "Edit Rule"} onClose={onCancelRule} visible={props.visible} size="x-small">
      <>
        <div className="side-panel-content side-panel-content-section">
          <form onSubmit={fwFormRule.handleSubmit}>
            <div className="field">
              <label htmlFor="fw-rule-port">Port</label>
              <WithTooltip className="w-9"
                           tooltip="You must use a specific port number from the standard port range (1-65535), a range (e. g. 80-443) or 'any'">
                <InputText id="fw-rule-port" name="port" value={fwFormRule.values.port}
                           className={classNames("w-full", {"p-invalid": isFieldInvalidRule("port")})}
                           onChange={fwFormRule.handleChange}/>
              </WithTooltip>
              {getFormErrorMessageRule("port")}
            </div>
            <div className="field">
              <label htmlFor="fw-rule-protocol">Protocol</label>
              <WithTooltip className="w-9"
                           tooltip="You may limit the rule to a specific protocol or use 'any' so the rule is evaluated regardless of the protocol used">
                <Dropdown id="fw-rule-protocol" name="protocol" options={optionsProtocol}
                          value={fwFormRule.values.protocol}
                          className={classNames("w-full", {"p-invalid": isFieldInvalidRule("protocol")})}
                          onChange={fwFormRule.handleChange}/>
                {getFormErrorMessageRule("protocol")}
              </WithTooltip>
            </div>
            <div className="field">
              <label htmlFor="fw-rule-host">Access for</label>
              {optionsHost.map(host => (
                <div key={host.value} className="field-radio-button ml-2">
                  <RadioButton id={host.value} name="host" value={host.value}
                               checked={fwFormRule.values.host === host.value} onChange={fwFormRule.handleChange}/>
                  <label htmlFor={host.value}>{host.label} </label>
                </div>
              ))}
            </div>
            {fwFormRule.values.host === "group" && (
              <div className="field">
                <label htmlFor="fw-rule-groups">Groups</label>
                <WithTooltip className="w-9"
                             tooltip="You may select one or more groups and the rule will grant access to all their members">
                  <MultiSelect
                    id="fw-rule-groups"
                    display="chip"
                    name="groups"
                    placeholder="Select"
                    options={optionsGroup?.map((g) => g.name)}
                    value={fwFormRule.values.groups}
                    className={classNames("w-full")}
                    onChange={fwFormRule.handleChange}
                  />
                </WithTooltip>
                {fwFormRule.values.groups.length > 1 && (
                  <>
                    Note: To match this rule user has to be a member of the groups{" "}
                    {fwFormRule.values.groups.map((group, index) => {
                      return (
                        <>
                          <span className="font-bold">{group}</span>
                          {index < fwFormRule.values.groups.length - 1 && " and "}
                        </>
                      );
                    })}
                    .
                  </>
                )}
              </div>
            )}
          </form>
        </div>
        <div className="side-panel-controls">
          <Button label={props.isNew ? "Create" : "Save"} icon={props.isNew ? "fa-regular fa-plus" : "fa-regular fa-save"}
                  className="p-button-sm" onClick={onSaveRule}/>
          <Button label="Cancel" className="p-button-sm p-button-text p-button-secondary" onClick={onCancelRule}/>
        </div>
      </>
    </SidePanel>
  );
}

export default FwConfigRuleDialog;
