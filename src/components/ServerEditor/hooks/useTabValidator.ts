import { useFormikContext } from "formik";

import { ExpertFormTab } from "../expert";

export function useTabValidator() {
  const { getFieldMeta } = useFormikContext();

  const validate = (fields: string[]) => {
    return fields.some(field => {
      const meta = getFieldMeta(field);
      return meta.touched && meta.error
    });
  };

  const isInvalid = (tab: ExpertFormTab) => {
    switch (tab) {
      case ExpertFormTab.General:
        return validate(["name", "note"]);
      case ExpertFormTab.AccessRights:
        return validate(["access.ipAddress", "access.fwConfig", "access.validTo"]);
      case ExpertFormTab.AttachedServices:
        return validate(["access.listeners"]);
      default:
        return false;
    }
  };
  return { isInvalid };
}
