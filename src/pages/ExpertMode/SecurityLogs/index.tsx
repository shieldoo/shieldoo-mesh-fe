import React, { useCallback, useEffect, useState } from 'react';
import { Column } from 'primereact/column';
import { DataTableExpandedRows, DataTableRowToggleParams } from 'primereact/datatable';

import { LogItem, useLazySecurityLogsQuery } from '../../../api/generated';
import { InputText } from "primereact/inputtext";
import Page from "../../../components/Page";
import { Calendar } from "primereact/calendar";
import { HeaderPanelWithFilter } from "../../../components/HeaderPanelWithFilter";
import WithTooltip from '../../../components/WithTooltip';
import { Ellipsis } from "../../../components/Ellipsis";
import useToast from "../../../hooks/useToast";
import JsonViewer from "../../../components/JsonViewer";
import { useFormik } from "formik";
import DataTable from '../../../components/DataTable';
import DateFormat from '../../../Common/Utils/DateFormat';
import { AppRoute, IAppRoute } from '../../../AppRoute';

interface SecurityLogItem {
  id: number,
  upn: String,
  created: String
  logType: String,
  message: String
  data: string
}

function SecurityLogs() {

  const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows>({});
  const [isLoadingLogs, setLoadingLogs] = useState<boolean>(true);
  const [logsData, setLogsData] = useState<Array<SecurityLogItem>>([]);
  const [getLogs] = useLazySecurityLogsQuery();
  const toast = useToast();

  const searchInfo: string = "The search field filters the JSON content of the log.\n" +
    "\n" +
    "To query the log fields, use 'Field=Value' for a 'LIKE' comparison, or 'Field~Value' for a strict equality.\n" +
    "\n" +
    "To query multiple log fields, separate them with a comma.\n" +
    "\n" +
    "Nested fields are separated by a dot, e.g. 'CurrentObject.ID=1, Entity=Access'."

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
        setLogsData(transformLogItems(result.data?.securityLogs));
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

  const transformLogItems = (items: Array<LogItem> | undefined): Array<SecurityLogItem> => {
    return items?.map(item => {
      try {
        const data = JSON.parse(item.data);
        return {
          id: item.id,
          upn: item.upn,
          created: DateFormat.toReadableString(item.created),
          logType: data.LogType,
          message: data.Message,
          data: item.data
        }
      } catch (e) {
        return {
          id: item.id,
          upn: item.upn,
          created: DateFormat.toReadableString(item.created),
          logType: "",
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
    <Page windowTitle={securityLogsRoute.title} className="page-security-logs">
      <HeaderPanelWithFilter titleText={securityLogsRoute.title} filterContent={
        <div className='flex flex-grow-1'>
          <InputText name="upn" value={filterForm.values.upn} onChange={filterForm.handleChange} placeholder="UPN"
                     className="mr-3"/>
          <Calendar name="createdSince" style={{width: '16rem'}} value={filterForm.values.createdSince}
                    onChange={filterForm.handleChange} placeholder="Created Since" icon="fa-regular fa-calendar" showTime
                    showIcon showButtonBar dateFormat="yy-mm-dd" className="mr-3"/>
          <Calendar name="createdUntil" style={{width: '16rem'}} value={filterForm.values.createdUntil}
                    onChange={filterForm.handleChange}
                    placeholder="Created Until" icon="fa-regular fa-calendar" showTime showIcon showButtonBar dateFormat="yy-mm-dd"
                    className="mr-3"/>
          <WithTooltip className='flex-grow-1' tooltip={searchInfo}>
            <InputText name="filter" value={filterForm.values.filter} placeholder="Query Search" className='w-full'
                       onChange={filterForm.handleChange}/>
          </WithTooltip>
        </div>
      } onFilter={doFilter} onFilterReset={clearFilter}/>

      <div className="content-wrapper">
        <DataTable className='mt-3' lazy loading={isLoadingLogs} value={logsData} responsiveLayout="stack"
                   emptyMessage="No security logs found" rowExpansionTemplate={log => <JsonViewer content={log.data}/>}
                   dataKey="id" expandedRows={expandedRows} onRowToggle={expandRow}>
          <Column style={{width: "4%"}} expander/>
          <Column style={{width: "8%"}} field="id" header="ID"/>
          <Column style={{width: "25%"}} field="upn" header="UPN"/>
          <Column style={{width: "10%"}} field="logType" header="Log Type"/>
          <Column style={{width: "30%", maxWidth: "390px"}} body={log => Ellipsis({value: log.message})} header="Message"/>
          <Column style={{width: "20%"}} field="created" header="Created"></Column>
        </DataTable>
      </div>
    </Page>
  );
}

const securityLogsRoute: IAppRoute = {
  path: () => AppRoute.SecurityLogs,
  page: <SecurityLogs />,
  title: "Security Logs",
  iconClassName: "fa-regular fa-th-list",
  isAdminPage: true,
  isExpertMode: true,
};

export default securityLogsRoute;