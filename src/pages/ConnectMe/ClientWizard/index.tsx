import { MenuItem } from "primereact/menuitem";

import { ClientOs } from "../ConnectMeTypes";
import Page from "../../../components/Page";
import HeaderPanelWithBreadcrumb from "../../../components/HeaderPanelWithBreadcrumb";
import ClientWizardContent from "./ClientWizardContent";
import { installationsRoute } from "..";

type Props = {
  clientOs: ClientOs;
  selectOs: () => void;
};
function ClientWizard(props: Props) {
  const items: MenuItem[] = [{ label: installationsRoute.title, command: props.selectOs }];

  return (
    <Page windowTitle={installationsRoute.title} className="page-client-setup">
      <HeaderPanelWithBreadcrumb titleText={props.clientOs} items={items} back={props.selectOs} />
      <div className="content-wrapper">
        <ClientWizardContent clientOs={props.clientOs} />
      </div>
    </Page>
  );
}

export default ClientWizard;
