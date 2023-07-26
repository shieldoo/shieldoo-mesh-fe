import { useFormikContext } from "formik";
import { MenuItem } from "primereact/menuitem";
import { TabMenu } from "primereact/tabmenu";
import { useEffect, useState } from "react";

import { Server } from "../../../api/generated";
import { useTabValidator } from "../hooks/useTabValidator";
import GeneralTab from "./GeneralTab";
import AccessRightsTab from "./AccessRightsTab";
import AttachedServicesTab from "./AttachedServicesTab";
import { deepClone } from "../../../Common/Utils/ParseUtils";

export enum ExpertFormTab {
  General,
  AccessRights,
  AttachedServices,
}
function ExpertForm() {
  const { values, setValues } = useFormikContext();
  const validator = useTabValidator();

  const attachedServicesCount = (values as Server)?.access?.listeners?.length || 0;

  const [tab, setTab] = useState<ExpertFormTab>(ExpertFormTab.General);
  const tabItems: MenuItem[] = [
    {
      label: `General`,
      command: () => setTab(ExpertFormTab.General),
      className: validator.isInvalid(ExpertFormTab.General) ? "p-error" : "",
    },
    {
      label: "Access Rights",
      command: () => setTab(ExpertFormTab.AccessRights),
      className: validator.isInvalid(ExpertFormTab.AccessRights) ? "p-error" : "",
    },
    {
      label: `Attached Services (${attachedServicesCount})`,
      command: () => setTab(ExpertFormTab.AttachedServices),
      className: validator.isInvalid(ExpertFormTab.AttachedServices) ? "p-error" : "",
    },
  ];

  useEffect(() => {
    const server = deepClone(values as Server);
    const listeners = server.access.listeners || [];
    server.access.listeners = listeners.filter(item => item.forwardHost !== "");
    setValues(server);
    // eslint-disable-next-line
  }, [setValues]);

  return (
    <>
      <div className="content-tabs">
        <TabMenu model={tabItems} />
      </div>
      <div className="side-panel-content-section">
        <TabContent tab={tab} />
      </div>
    </>
  );
}

function TabContent({ tab }: { tab: ExpertFormTab }) {
  switch (tab) {
    case ExpertFormTab.General:
      return <GeneralTab />;
    case ExpertFormTab.AccessRights:
      return <AccessRightsTab />;
    case ExpertFormTab.AttachedServices:
      return <AttachedServicesTab />;
    default:
      return <></>;
  }
}

export default ExpertForm;
