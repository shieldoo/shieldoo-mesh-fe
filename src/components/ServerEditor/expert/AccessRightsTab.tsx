import { useCodeListFirewallsQuery } from "../../../api/generated";
import FormikDropdown from "../../Formik/FormikDropdown";
import FormikInputText from "../../Formik/FormikInputText";
import FormikMultiSelect from "../../Formik/FormikMultiselect";
import ValidityComponent from "../../Formik/ValidityComponent";
import { useGroups } from "../hooks/useGroups";

function AccessRightsTab() {
  const { data: firewallData, isFetching: isFetchingFirewall } = useCodeListFirewallsQuery();
  const { getGroupNames, isFetchingGroups } = useGroups();

  return (
    <>
      <FormikInputText label="IP Address" name="access.ipAddress" />
      <FormikDropdown
        label="Firewall configuration"
        name="access.fwConfig.id"
        placeholder="Select firewall"
        options={firewallData?.codelistFirewalls}
        optionLabel="name"
        optionValue="id"
        disabled={isFetchingFirewall}
      />
      <FormikMultiSelect
        label="Groups"
        display="chip"
        name="access.groups"
        options={getGroupNames()}
        disabled={isFetchingGroups}
      />
      {/* <FormikCheckbox
        label="Punch back"
        name="access.punchBack"
        data-tooltip="Defines whether you want the node you are trying to reach to connect back to you if your UDP hole
         punching fails. This is extremely useful if one node is behind a difficult NAT, such as a symmetric NAT."
      />
      <FormikCheckbox
        label="Use websocket gateway"
        name="access.restrictiveNetwork"
        data-tooltip="Defines whether to enforce usage via Shieldoo websocket gateway so the connection works even from
         a site where, e. g. UDP is not allowed."
      /> */}
      <ValidityComponent />
    </>
  );
}

export default AccessRightsTab;
