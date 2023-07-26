import React, { useCallback, useEffect, useState } from 'react';
import { Column } from 'primereact/column';
import { DataTableExpandedRows, DataTableRowToggleParams } from 'primereact/datatable';

import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { HeaderPanelWithFilter } from "../../../components/HeaderPanelWithFilter";
import Page from "../../../components/Page";
import { LogItem, useLazyTelemetryLogsQuery, } from '../../../api/generated';
import WithTooltip from "../../../components/WithTooltip";
import { Ellipsis } from '../../../components/Ellipsis';
import useToast from "../../../hooks/useToast";
import JsonViewer from "../../../components/JsonViewer";
import { useFormik } from "formik";
import DataTable from '../../../components/DataTable';
import DateFormat from '../../../Common/Utils/DateFormat';
import { AppRoute, IAppRoute } from '../../../AppRoute';

interface TelemetryLogItem {
  id: number,
  upn: string,
  created: string,
  accessId: number,
  vpnIp: string,
  udpIp: string,
  port: string
  message: string
  data: string
}

function TelemetryLogs() {

  const searchInfo: string = "The search field filters the JSON content of the log.\n" +
    "\n" +
    "To query the log fields, use 'Field=Value' for a 'LIKE' comparison, or 'Field~Value' for a strict equality.\n" +
    "\n" +
    "To query multiple log fields, separate them with a comma.\n" +
    "\n" +
    "Nested fields are separated by a dot, e.g. 'CurrentObject.ID=1, Entity=Access'."

  const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows>({});
  const [isLoadingLogs, setLoadingLogs] = useState<boolean>(true);
  const [logsData, setLogsData] = useState<Array<TelemetryLogItem>>([]);
  const [getLogs] = useLazyTelemetryLogsQuery();
  const toast = useToast();

  const filterForm = useFormik({
    initialValues: {
      upn: "",
      createdSince: undefined as Date | undefined,
      createdUntil: undefined as Date | undefined,
      filter: ""
    },
    onSubmit: async () => {
      setLoadingLogs(true)
      getLogs({
        upn: filterForm.values.upn === "" ? "" : filterForm.values.upn + "%",
        createdFrom: filterForm.values.createdSince?.toISOString(),
        createdTo: filterForm.values.createdUntil?.toISOString(),
        filter: filterForm.values.filter
      }).then((result) => {
        setLogsData(transformLogItems(result.data?.telemetryLogs));
      }).catch(() => {
        toast.show({
          severity: "error",
          detail: "An unknown error occurred while loading the logs",
          life: 4000
        })
      }).finally(() => {
        setLoadingLogs(false);
      })
    }
  });

  useEffect(() => {
      filterForm.submitForm();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const doFilter = useCallback(() => {
    filterForm.submitForm();
  }, [filterForm])

  const clearFilter = useCallback(() => {
    filterForm.resetForm();
    filterForm.submitForm();
  }, [filterForm])

  const transformLogItems = (items: Array<LogItem> | undefined): Array<TelemetryLogItem> => {
    return items?.map(item => {
      try {
        const data = JSON.parse(item.data);
        return {
          id: item.id,
          upn: item.upn,
          created: DateFormat.toReadableString(item.created),
          accessId: data.accessId,
          vpnIp: data.vpnIp,
          udpIp: data.udpAddr?.ip ?? data.udpAddrs?.map((addr: { ip: string }) => addr.ip).join(", "),
          port: data.udpAddr?.port ?? data.udpAddrs?.map((addr: { port: number }) => addr.port).join(", "),
          message: data.msg,
          data: item.data
        }
      } catch (e) {
        return {
          id: item.id,
          upn: item.upn,
          created: DateFormat.toReadableString(item.created),
          accessId: "",
          vpnIp: "",
          udpIp: "",
          port: "",
          message: "",
          data: item.data
        };
      }
    }) ?? [];
  }

  const expandRow = useCallback((params: DataTableRowToggleParams) => {
    setExpandedRows(params.data as unknown as DataTableExpandedRows);
  }, []);

  return (
    <Page windowTitle={telemetryLogsRoute.title} className="page-telemetry-logs">
      <HeaderPanelWithFilter titleText={telemetryLogsRoute.title} filterContent={
        <form onSubmit={filterForm.handleSubmit}>
          <div className='flex flex-grow-1'>
            <InputText name="upn" value={filterForm.values.upn} onChange={filterForm.handleChange} placeholder="UPN"
                       className="mr-3"/>
            <Calendar name="createdSince" value={filterForm.values.createdSince} onChange={filterForm.handleChange}
                      placeholder="Created Since" icon="fa-regular fa-calendar" showTime showIcon showButtonBar dateFormat="yy-mm-dd"
                      className="mr-3"/>
            <Calendar name="createdUntil" value={filterForm.values.createdUntil} onChange={filterForm.handleChange}
                      placeholder="Created Until" icon="fa-regular fa-calendar" showTime showIcon showButtonBar dateFormat="yy-mm-dd"
                      className="mr-3"/>
            <WithTooltip className='flex-grow-1' tooltip={searchInfo}>
              <InputText name="filter" value={filterForm.values.filter} placeholder="Query Search" className='w-full'
                         onChange={filterForm.handleChange}/>
            </WithTooltip>
          </div>
        </form>
      } onFilter={doFilter} onFilterReset={clearFilter}/>

      <div className="content-wrapper">
        <DataTable className='mt-3' lazy loading={isLoadingLogs} value={logsData} responsiveLayout="stack" stripedRows
                   emptyMessage="No telemetry logs found" rowExpansionTemplate={log => <JsonViewer content={log.data}/>}
                   dataKey="id" expandedRows={expandedRows} onRowToggle={expandRow}>
          <Column style={{width: "42px"}} expander/>
          <Column style={{width: "95px"}} field="id" header="ID"/>
          <Column style={{width: "190px", maxWidth: "190px"}} body={log => Ellipsis({value: log.upn})} header="UPN"/>
          <Column style={{width: "145px", maxWidth: "145px"}} body={log => Ellipsis({value: log.vpnIp})} header="VPN IP"/>
          <Column style={{width: "145px", maxWidth: "145px"}} body={log => Ellipsis({value: log.udpIp})} header="UDP IP"/>
          <Column style={{width: "100px", maxWidth: "100px"}} body={log => Ellipsis({value: log.port})} header="Port"/>
          <Column style={{maxWidth: "190px"}} body={log => Ellipsis({value: log.message})} header="Message"/>
          <Column style={{width: "210px"}} field="created" header="Created"/>
        </DataTable>
      </div>
    </Page>
  );
}

const telemetryLogsRoute: IAppRoute = {
  path: () => AppRoute.TelemetryLogs,
  page: <TelemetryLogs />,
  title: "Telemetry Logs",
  iconClassName: "fa fa-list",
  isAdminPage: true,
  isExpertMode: true,
};

export default telemetryLogsRoute;