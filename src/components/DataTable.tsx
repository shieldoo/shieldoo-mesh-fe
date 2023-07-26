import React, { useMemo } from 'react';
import { DataTable as PrimeDataTable, DataTableProps } from 'primereact/datatable';
import { useSelector } from 'react-redux';

import { selectors as authSelectors } from '../ducks/auth';

function DataTable(props: DataTableProps) {
  const config = useSelector(authSelectors.selectUiConfig);
  const data = props.value;
  const dbRecords = data?.length || 0;
  const maxDBRecords = config?.maxDBRecords || 0;

  const footer = useMemo(() => {
    let recordsFooter = null;

    if (dbRecords >= maxDBRecords) {
      recordsFooter = <div className='max-records-shown-message'>Not all records are displayed here. Use the filter to narrow down the number of displayed records.</div>;
    }

    return props.footer || recordsFooter
      ? <>
        {props.footer}
        {recordsFooter}
      </>
      : null;
  }, [dbRecords, maxDBRecords, props.footer]);

  return <PrimeDataTable {...props} footer={footer} />;
}

export default DataTable;
