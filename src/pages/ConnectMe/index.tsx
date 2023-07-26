import { useCallback, useState } from "react";

import { Client } from "./ConnectMeTypes";
import SelectOs from "./SelectOs";
import ClientWizard from "./ClientWizard";
import { AppRoute, IAppRoute } from "../../AppRoute";
import myAccessRightsRoute from "../MyAccessRights/MyAccessRightsPage";
import myDevicesRoute from "../MyDevices/MyDevices";

function Installations() {
  const [client, setClient] = useState<Client>();
  const reset = useCallback(() => {
    setClient(undefined);
  }, []);

  if (client === undefined) {
    return <SelectOs onClick={setClient} />;
  }

  return <ClientWizard clientOs={client.os} selectOs={reset} />;
}

export const installationsRoute: IAppRoute = {
  path: () => AppRoute.Installations,
  page: <Installations />,
  title: "Download & Install",
  iconClassName: "fa-regular fa-plug",
};

const connectMeRoute: IAppRoute = {
  path: () => AppRoute.ConnectMe,
  page: <></>,
  title: "Connect Me",
  iconClassName: "fa-regular fa-plug",
  subRoutes: [installationsRoute, myDevicesRoute, myAccessRightsRoute]
};

export default connectMeRoute;
