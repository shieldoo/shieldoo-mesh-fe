import { Column } from "primereact/column";
import { classNames } from "primereact/utils";
import { Fragment, useState } from "react";

import { AadConfigData, CliApiConfig, CostUsageItem, CostUsageMonthItem, SystemConfigData, useCostsUsageQuery, useSystemConfigQuery } from "../../api/generated";
import { AppRoute, IAppRoute } from "../../AppRoute";
import DataTable from "../../components/DataTable";
import HeaderPanel from "../../components/HeaderPanel";
import Page from "../../components/Page";
import TopBar from "../../components/TopBar";
import { roundNumberToTwoDecimals } from "../../Common/Utils/Math";
import SystemEdit from "./SystemEdit";
import securityLogsRoute from "../ExpertMode/SecurityLogs";
import telemetryLogsRoute from "../ExpertMode/TelemetryLogs";
import IdentityEdit from "./IdentityEdit";
import CliApiEdit from "./CliApiEdit";

function CostItem({ item }: { item: CostUsageItem }): JSX.Element {
  return (
    <div className="flex" style={{ lineHeight: "3rem" }} key={item.yearMonth + item.upn}>
      <div className="col-6 ml-3">
        <i className={classNames('fa', { 'fa-user': item.isUser, 'fa-server': !item.isUser })}></i>
        <span style={{ paddingLeft: "1rem" }}>{item.upn}</span>
      </div>
      <div className="col-3">$ {roundNumberToTwoDecimals(item.cost)}</div>
      <div className="col-3">{item.hours} hours</div>
    </div>
  )
}

function System() {
  const [systemConfigEdit, setSystemConfigEdit] = useState<SystemConfigData | undefined>(undefined);
  const [systemIdentityEdit, setIdentityEdit] = useState<AadConfigData | undefined>(undefined);
  const [systemCliApiEdit, setCliApiEdit] = useState<CliApiConfig | undefined>(undefined);
  const { data: cfg, isFetching: isSystemConfigLoading, refetch: refetchSystemConfig } = useSystemConfigQuery();
  const { data: costs } = useCostsUsageQuery();
  const [expandedRows, setExpandedRows] = useState<any>(null);

  const onClickEdit = () => {
    setSystemConfigEdit({
      networkCidr: cfg?.systemConfig.networkCidr || "",
    });
  };

  const onClickIdentityConfigure = () => {
    setIdentityEdit({
      tenantId: cfg?.systemConfig.aadConfig.tenantId || "",
      clientId: cfg?.systemConfig.aadConfig.clientId || "",
      clientSecret: cfg?.systemConfig.aadConfig.clientSecret || "",
      adminGroupObjectId: cfg?.systemConfig.aadConfig.adminGroupObjectId || "",
      isEnabled: cfg?.systemConfig.aadConfig.isEnabled || false,
    });
  };

  const onClickCliApi = () => {
    setCliApiEdit({
      isEnabled: cfg?.systemConfig.cliApiConfig.isEnabled || false,
      apiKey: cfg?.systemConfig.cliApiConfig.apiKey || "",
      url: cfg?.systemConfig.cliApiConfig.url || "",
    });
  };

  const firstLighthouse = cfg?.systemConfig?.lighthouses?.[0];

  const topBar = (
    <TopBar size="large">
      <div className="flex">
        <div className="ml-4">
          <div className="toolbar-text-large">{systemRoute.title}</div>
          <div className="toolbar-text-normal"></div>
        </div>
      </div>
      <div className="flex">
        <div className="ml-4">
          <div className="toolbar-panel">
            <div className="header-text">CIDR</div>
            <div className="body-text">{cfg?.systemConfig?.networkCidr}</div>
            <div className="footer-text">
              configure
              <i onClick={onClickEdit} className="toolbar-button fa-regular fa-edit"></i>
            </div>
          </div>
        </div>
        <div className="ml-4">
          <div className="toolbar-panel">
            <div className="header-text">Identity integration</div>
            <div className="body-text">
              {cfg?.systemConfig.aadConfig.isEnabled ? "Azure Active Directory" : "Not configured"}
            </div>
            <div className="footer-text">
              configure
              <i onClick={onClickIdentityConfigure} className="toolbar-button fa-regular fa-edit"></i>
            </div>
          </div>
        </div>
        <div className="ml-4">
          <div className="toolbar-panel">
            <div className="header-text">Integration API (CLI)</div>
            <div className="body-text">
              {cfg?.systemConfig.cliApiConfig.isEnabled ? "Enabled" : "Not configured"}
            </div>
            <div className="footer-text">
              configure
              <i onClick={onClickCliApi} className="toolbar-button fa-regular fa-edit"></i>
            </div>
          </div>
        </div>
        <div className="ml-4">
          <div className="toolbar-panel">
            <div className="header-text">Lighthouse: {firstLighthouse?.ipAddress}</div>
            <div className="body-text">{firstLighthouse?.publicIp}:{firstLighthouse?.port}</div>
            <div className="footer-text">
            </div>
          </div>
        </div>
      </div>
    </TopBar>
  );

  const onClose = (e: SystemConfigData | undefined) => {
    if (e !== undefined) {
      refetchSystemConfig();
    }
    setSystemConfigEdit(undefined);
  };

  const onCloseIdentity = (e: AadConfigData | undefined) => {
    if (e !== undefined) {
      refetchSystemConfig();
    }
    setIdentityEdit(undefined);
  };

  const onCloseCliApi = () => {
    setCliApiEdit(undefined);
  };

  const onChangeCliApi = (e: CliApiConfig | undefined) => {
    if (e !== undefined) {
      refetchSystemConfig();
    }
  };

  const bodyCostUsageMonthPeriod = (rowData: CostUsageMonthItem) => {
    // parse yyyyMM to yyyy-MM
    const year = rowData.yearMonth.substring(0, 4);
    const month = rowData.yearMonth.substring(4, 6);
    return year + "-" + month;
  };

  const bodyCostUsageMonthCost = (rowData: CostUsageMonthItem) => {
    return "$ " + roundNumberToTwoDecimals(rowData.cost);
  };


  function renderResourceCost(data: CostUsageMonthItem): JSX.Element {
    let content = <div>No data found</div>;
  
    if (data.costUsageItems.length > 0) {
      content = (
        <Fragment>
          {data.costUsageItems.map(costitem => (
            <CostItem key={`upn-${costitem.upn}`} item={costitem} />
          ))}
        </Fragment>
      );
    }
  
    return <div style={{ paddingLeft: 43 }}>{content}</div>;
  }

  return (
    <>
      <Page windowTitle={settingsLogsRoute.title} className="page-system" topBar={topBar}>
        <HeaderPanel titleText="Cost usage"></HeaderPanel>
        <div className="content-wrapper">
          <DataTable
            className="system-list-table"
            loading={isSystemConfigLoading}
            lazy
            value={costs?.monthCostUsage || []}
            responsiveLayout="scroll"
            expandedRows={expandedRows}
            onRowToggle={e => setExpandedRows(e.data)}
            rowExpansionTemplate={renderResourceCost}
          emptyMessage="No costs found"
          >
            <Column expander />
            <Column style={{ width: "50%" }} field="yearMonth" header="Period" body={bodyCostUsageMonthPeriod}></Column>
            <Column style={{ width: "50%" }} field="cost" header="Cost" body={bodyCostUsageMonthCost}></Column>
          </DataTable>
        </div>
        <SystemEdit visible={systemConfigEdit !== undefined} config={systemConfigEdit} onClose={onClose} />
        <IdentityEdit
          visible={systemIdentityEdit !== undefined}
          logMessage={cfg?.systemConfig.aadConfig.lastProcessingMessage || ""}
          config={systemIdentityEdit}
          onClose={onCloseIdentity}
        />
        <CliApiEdit
          visible={systemCliApiEdit !== undefined}
          config={systemCliApiEdit}
          onClose={onCloseCliApi}
          onChange={onChangeCliApi}
        />
      </Page>
    </>
  );
}

const systemRoute: IAppRoute = {
  path: () => AppRoute.SettingsLogs,
  page: <System />,
  title: "System Settings",
  iconClassName: "fa-regular fa-cog",
  isAdminPage: true,
  isExpertMode: true,
};

const settingsLogsRoute: IAppRoute = {
  path: () => AppRoute.SettingsLogs,
  page: <></>,
  title: "Settings & Logs",
  iconClassName: "fa-regular fa-cog",
  isAdminPage: true,
  isExpertMode: true,
  subRoutes: [systemRoute, telemetryLogsRoute, securityLogsRoute],
};

export default settingsLogsRoute;
