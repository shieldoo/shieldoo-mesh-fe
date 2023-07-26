/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column, ColumnBodyOptions } from "primereact/column";
import { classNames } from "primereact/utils";
import { FormikErrors, useFormik } from "formik";
import { Menu } from "primereact/menu";
import { MenuItem } from "primereact/menuitem";
import SidePanel from "../SidePanel";

import { FwConfigRule, useLazyGetFirewallQuery, useSaveFirewallMutation, GetFirewallQuery } from "../../api/generated";
import { RequestError } from "../../api/graphqlBaseQueryTypes";
import FwConfigRuleEditor from "./FwConfigRuleEditor";
import useToast from "../../hooks/useToast";
import WithTooltip from "../WithTooltip";
import DataTable from "../DataTable";
import { cannotBeEmpty } from "../../Common/Constants/validationMessages";

type FwConfigDialogProps = {
  visible: boolean;
  fwconfigId: number;
  onClose: (fwconfig: FwConfig | null) => void;
};

export type FirewallRuleEditData = {
  index: number;
  direction: string;
  rule: FwConfigRule;
};

type FwConfig = GetFirewallQuery["firewallConfiguration"];

function FwConfigDialog(props: FwConfigDialogProps) {
  const [showOutboundRules, setShowOutboundRules] = useState(false);
  const [editedFwConfigRule, setEditedFwConfigRule] = useState<FirewallRuleEditData | undefined>(undefined);
  const [editedFwConfig, setEditedFwConfig] = useState<FwConfig | undefined>(undefined);
  const [getFirewall] = useLazyGetFirewallQuery();
  const [saveFirewall] = useSaveFirewallMutation();
  const toast = useToast();

  useEffect(() => {
    const actionGetFirewall = async (id: number) => {
      try {
        const fwdetail = await getFirewall({ id: id }).unwrap();
        let loadedFw: FwConfig = {
          id: fwdetail.firewallConfiguration.id,
          name: fwdetail.firewallConfiguration.name,
          fwConfigIns: [...fwdetail.firewallConfiguration.fwConfigIns],
          fwConfigOuts: [...fwdetail.firewallConfiguration.fwConfigOuts],
        };
        setEditedFwConfig(loadedFw);
        fillFormData(loadedFw);
      } catch (ex) {
        let e = ex as RequestError;
        let emsg = "An unknown error occurred while loading the firewall settings";
        if (e.errors.length > 0) {
          emsg = e.errors[0].message;
        }
        toast.show({
          severity: "error",
          detail: emsg,
          life: 4000,
        });
      }
    };

    if (props.visible) {
      if (props.fwconfigId !== 0) {
        actionGetFirewall(props.fwconfigId);
      } else {
        const newFwConfig: FwConfig = {
          id: 0,
          name: "",
          fwConfigIns: [],
          fwConfigOuts: [{ proto: "any", port: "any", host: "any" }],
        };
        setEditedFwConfig(newFwConfig);
        fillFormData(newFwConfig);
      }
    } else {
      setEditedFwConfig(undefined);
      fillFormData(undefined);
    }
  }, 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [props.visible, props.fwconfigId]);

  const fillFormData = async (fwconfig: FwConfig | undefined) => {
    // fill form with data
    if (fwconfig) {
      fwForm.setValues({
        name: fwconfig.name || "",
        fwConfigIns: fwconfig.fwConfigIns,
        fwConfigOuts: fwconfig.fwConfigOuts,
      });
    } else {
      fwForm.resetForm();
    }
  }

  const addFirewallRuleIn = useCallback(() => {
    setEditedFwConfigRule({
      index: -1,
      direction: "in",
      rule: { proto: "any", port: "", host: "any" },
    });
  }, [setEditedFwConfigRule]);
  const addFirewallRuleOut = useCallback(() => {
    setEditedFwConfigRule({
      index: -1,
      direction: "out",
      rule: { proto: "any", port: "", host: "any" },
    });
  }, [setEditedFwConfigRule]);

  const onEditRuleClosed = (fwconfig: FwConfigRule | null): void => {
    if (fwconfig) {
      let fwc = [...((editedFwConfigRule?.direction === "in" ? editedFwConfig?.fwConfigIns : editedFwConfig?.fwConfigOuts) || [])];
      if (editedFwConfigRule?.index === -1) {
        fwc?.push(fwconfig);
      } else {
        if (editedFwConfigRule) {
          fwc?.splice(editedFwConfigRule.index, 1, fwconfig);
        }
      }
      const updateRules = [...fwc];
      const updateConfig = {
        ...editedFwConfig,
        ...(editedFwConfigRule?.direction === "in" ? { fwConfigIns: updateRules } : { fwConfigOuts: updateRules }),
      };
      setEditedFwConfig(updateConfig as FwConfig);
    }
    setEditedFwConfigRule(undefined);
  };

  const onRuleDelete = (index: number, direction: string): void => {
    let fwc = [...((direction === "in" ? editedFwConfig?.fwConfigIns : editedFwConfig?.fwConfigOuts) || [])];
    fwc?.splice(index, 1);
    const updateRules = [...fwc];
    const updateConfig = {
      ...editedFwConfig,
      ...(direction === "in" ? { fwConfigIns: updateRules } : { fwConfigOuts: updateRules }),
    };
    setEditedFwConfig(updateConfig as FwConfig);
  };

  const fwForm = useFormik({
    initialValues: {
      name: "",
      fwConfigIns: new Array<FwConfigRule>(),
      fwConfigOuts: new Array<FwConfigRule>(),
    },
    validate: (data) => {
      let errors: FormikErrors<{ name: string }> = {};

      if (!data.name) {
        errors.name = cannotBeEmpty;
      }

      return errors;
    },
    onSubmit: async (data) => {
      data.fwConfigIns = editedFwConfig?.fwConfigIns || new Array<FwConfigRule>();
      data.fwConfigOuts = editedFwConfig?.fwConfigOuts || new Array<FwConfigRule>();
      try {
        const ret = await saveFirewall({
          data: {
            id: editedFwConfig!.id || undefined,
            ...data,
          },
        }).unwrap();
        const retdata =  {
            ...editedFwConfig!,
            id: ret.firewallConfigurationSave.id,
            name: data.name,
            fwConfigIns: data.fwConfigIns,
            fwConfigOuts: data.fwConfigOuts,
        };
        props.onClose(retdata);
        toast.show({
          severity: "success",
          detail: `Firewall '${data.name}' has been saved successfully`,
          life: 4000,
        });
      } catch (ex) {
        let e = ex as RequestError;
        let emsg = "An unknown error occurred while saving the firewall";
        if (e.errors.length > 0) {
          emsg = e.errors[0].message;
        }
        toast.show({
          severity: "error",
          detail: emsg,
          life: 4000,
        });
      }
    },
  });

  const isFieldInvalid = (name: "name") => !!(fwForm.touched[name] && fwForm.errors[name]);
  const getFormErrorMessage = (name: "name") => {
    return isFieldInvalid(name) && <small className="p-error">{fwForm.errors[name]}</small>;
  };
  const onSave = useCallback(() => fwForm.submitForm(), [fwForm]);
  const onCancel = useCallback(() => {
    props.onClose(null);
  }, [props]);

  function FwRules(
    fwrules: FwConfigRule[] | undefined,
    myDirection: string,
    onDelete: (index: number, direction: string) => void,
    show: boolean,
    onShow: () => void
  ) {
    function ContextMenuRules(fwr: FwConfigRule, props: ColumnBodyOptions) {
      const popupMenuRule = useRef<Menu>(null);

      const menuItems: MenuItem[] = [
        {
          label: "Edit",
          icon: "fa-regular fa-pencil",
          command: () => {
            setEditedFwConfigRule({
              index: props.rowIndex,
              direction: myDirection,
              rule: fwr,
            });
          },
        },
        {
          label: "Delete",
          icon: "fa-regular fa-trash",
          className: "danger",
          command: async () => {
            onDelete(props.rowIndex, myDirection);
          },
        },
      ];

      return (
        <div className="flex">
          <Menu model={menuItems} className="user-dropdown-menu" popup ref={popupMenuRule} />
          <Button type="button" className="p-button-link" icon="fa-regular fa-ellipsis-v" onClick={(e) => popupMenuRule.current?.toggle(e)} />
        </div>
      );
    }

    const myLabel = myDirection === "in" ? "Inbound Rules" : "Outbound Rules";
    const detailColumnGroups = (rowData: FwConfigRule) => {
      let ret = rowData.host;
      if (ret === "group") {
        ret += ": " + rowData.groups?.map((g) => g.name).join(", ");
      }
      return ret;
    };

    const addAction = myDirection === "in" ? addFirewallRuleIn : addFirewallRuleOut;
    return (
      <>
        <div className="flex align-items-center mb-4">
          <label htmlFor="fw-out-rule">{myLabel} &nbsp;&nbsp;</label>
          {show && (
            <Button
              type="button"
              label="Create"
              className="p-button-mini"
              icon="fa-regular fa-plus"
              onClick={addAction}
            />
          )}
        </div>
        {show ? (
          <div>
            <DataTable value={fwrules} responsiveLayout="stack" emptyMessage="No rules found">
              <Column style={{ width: "25%" }} field="proto" header="Protocol" />
              <Column style={{ width: "25%" }} field="port" header="Port" />
              <Column style={{ width: "45%" }} field="host" header="Groups" body={detailColumnGroups} />
              <Column style={{ width: "5%" }} header="Action" body={ContextMenuRules}></Column>
            </DataTable>
          </div>
        ) : (
          <div>
            Editing outbound rules may cause the configuration malfunction. <a className="clickable" onClick={onShow}>Edit anyway</a>.
          </div>
        )}
      </>
    );
  }

  const defaultTitle = "Create Firewall";
  const title = editedFwConfig && editedFwConfig.id ? editedFwConfig.name || defaultTitle: defaultTitle;

  return (
    <>
      <SidePanel title={title} onClose={onCancel} size="small" visible={!!props.visible}>
        <>
          <div className="side-panel-content side-panel-content-section">
            <form onSubmit={fwForm.handleSubmit}>
              <div className="field">
                <label htmlFor="fw-name">Name</label>
                <WithTooltip className="w-6" tooltip="The firewall name will be used to identify the firewall in the user access configuration">
                  <InputText
                    id="fw-name"
                    name="name"
                    value={fwForm.values.name}
                    className={classNames("w-full", {
                      "p-invalid": isFieldInvalid("name"),
                    })}
                    onChange={fwForm.handleChange}
                  />
                </WithTooltip>
                {getFormErrorMessage("name")}
              </div>
              <div className="field">{FwRules(editedFwConfig?.fwConfigIns, "in", onRuleDelete, true, () => {})}</div>
              <div className="field">
                {FwRules(editedFwConfig?.fwConfigOuts, "out", onRuleDelete, showOutboundRules, () =>
                  setShowOutboundRules(true)
                )}
              </div>
            </form>
          </div>
          <div className="side-panel-controls">
            <Button label={editedFwConfig?.id ? "Save" : "Create"} icon={editedFwConfig?.id ? "fa-regular fa-save" : "fa-regular fa-plus"} className="p-button-sm" onClick={onSave} />
            <Button label="Cancel" className="p-button-sm p-button-text p-button-secondary" onClick={onCancel} />
          </div>
        </>
      </SidePanel>

      <FwConfigRuleEditor visible={!!editedFwConfigRule} fwconfigRule={editedFwConfigRule?.rule} isNew={editedFwConfigRule?.index === -1} onClose={onEditRuleClosed} />
    </>
  );
}

export default FwConfigDialog;
