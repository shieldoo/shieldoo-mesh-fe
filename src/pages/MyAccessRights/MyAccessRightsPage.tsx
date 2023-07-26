import { Column } from "primereact/column";
import { classNames } from "primereact/utils";
import { Fragment, useEffect, useState } from "react";

import { Server, Access, useAccessRightsQuery } from "../../api/generated";
import { AppRoute, IAppRoute } from "../../AppRoute";
import { wrapLinks } from "../../Common/Utils/ParseUtils";
import DataTable from "../../components/DataTable";
import HeaderPanel from "../../components/HeaderPanel";
import Page from "../../components/Page";
import ServerStatusTag from "../../components/ServerStatusTag";
import { AccessCard, AccessRight, AccessRightListener } from "./MyAccessRightsTypes";
import { convertAccessRightsQueryToAccesses } from "./MyAccessRightsUtils";

function MyAccessRightsPage(): JSX.Element {
  const [accesses, setAccesses] = useState<AccessCard[] | undefined>();
  const [expandedRows, setExpandedRows] = useState<any>(null);
  const { isFetching: isFetchingAccessRights, data: accessRightsData } = useAccessRightsQuery({});

  useEffect(() => {
    if (accessRightsData) {
      setAccesses(convertAccessRightsQueryToAccesses(accessRightsData));
    }
  }, [accessRightsData]);

  const serverStatusBadge = (acc: AccessRight) => {
    const access: Access = {
      id: 0,
      name: "",
      changed: new Date(),
      fqdn: acc.serverName,
      ipAddress: acc.ip,
      punchBack: false,
      restrictiveNetwork: false,
      validFrom: new Date(),
      validTo: new Date(),
      listeners: [],
      groups: [],
      fwConfig: {
        id: 0,
        changed: new Date(),
        fwConfigIns: [],
        fwConfigOuts: [],
      },
      statistics: {
        isConnectd: acc.statistic.isConnectd,
        isOverRestrictiveNetwork: acc.statistic.isOverRestrictiveNetwork,
        lastContact: acc.statistic.lastContact,
        lastContactFromNow: acc.statistic.lastContactFromNow,
      },
    };
    const server: Server = {
      id: 0,
      name: acc.serverName,
      allowAutoUpdate: false,
      access: access,
      serverOSAutoUpdatePolicy: {
        allAutoUpdateEnabled: false,
        osAutoUpdateEnabled: false,
        osAutoUpdateHour: 0,
        restartAfterUpdate: false,
        securityAutoUpdateEnabled: false,
      },
    };
    return ServerStatusTag({ server: server });
  };

  return (
    <Page windowTitle={myAccessRightsRoute.title} className="page-myaccessrights">
      <HeaderPanel
        titleText={myAccessRightsRoute.title}
        showSearch
        searchPlaceHolder="Search by server name..."
        onSearch={() => undefined}
      />
      <div className="content-wrapper">
        {accesses?.map(access => (
          <div key={access.name}>
            <h2 style={{ textAlign: "left", fontSize: 16 }}>
              <div style={{ fontSize: 12 }}>Access card</div>
              <i className="fa fa-lg fa-id-card-o" />             
            </h2>
            <DataTable
              lazy
              value={access.rights ? access.rights : []}
              responsiveLayout="scroll"
              expandedRows={expandedRows}
              onRowToggle={e => setExpandedRows(e.data)}
              rowExpansionTemplate={renderListeners}
              loading={isFetchingAccessRights}
              emptyMessage="No access rights found"
            >
              <Column expander />
              <Column style={{ width: "25%" }} field="serverName" header="Server Name"></Column>
              <Column style={{ width: "20%" }} field="ip" header="IPv4 Address"></Column>
              <Column
                style={{ width: "10%" }}
                header="Services"
                body={(data: AccessRight) => <span>{data.listeners.length}</span>}
              ></Column>
              <Column style={{ width: "15%", whiteSpace: "nowrap" }} field="" header="Status" body={serverStatusBadge} />
              <Column
                style={{ width: "45%" }}
                field="description"
                className="long-text"
                header="Description"
                body={data => wrapLinks(data.description)}
              ></Column>
            </DataTable>
          </div>
        ))}
      </div>
    </Page>
  );
}

function renderListeners(data: AccessRight): JSX.Element {
  let content = <div>No attached services found</div>;

  if (data.listeners.length > 0) {
    content = (
      <Fragment>
        <h2 style={{ fontSize: 14, fontWeight: "bold", marginBottom: 5 }}>Attached services</h2>

        {data.listeners.map(listener => (
          <Listener key={`listenPort-${listener.listenPort}`} listener={listener} />
        ))}
      </Fragment>
    );
  }

  return <div style={{ paddingLeft: 43 }}>{content}</div>;
}

function Listener({ listener }: { listener: AccessRightListener }): JSX.Element {
  return (
    <div style={{ lineHeight: "3rem" }} key={listener.forwardHost + listener.forwardPort}>
      <span style={{ fontSize: 13, fontWeight: "bolder", marginRight: 10 }}>
        <i className={classNames('fa', listener.icon)} /> Service on port {listener.listenPort} ({listener.protocol}):
      </span>
      <span>Description: {wrapLinks(listener.description)} </span>
    </div>
  );
}

const myAccessRightsRoute: IAppRoute = {
  path: () => AppRoute.AccessRights,
  page: <MyAccessRightsPage />,
  title: "My Access Rights",
  iconClassName: "fa fa-id-card-o",
};

export default myAccessRightsRoute;
