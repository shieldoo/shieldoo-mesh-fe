import React from 'react';
import { Column } from 'primereact/column';

import { useServersQuery } from '../../api/generated';
import DataTable from '../DataTable';

function ServersList() {
  const { isFetching, data } = useServersQuery();

  return (
    <div className="servers-list">
      <DataTable value={data?.servers} loading={isFetching}>
        <Column field="name" header="Name"></Column>
        <Column field="description" header="Description"></Column>
      </DataTable>
    </div>
  );
}

export default ServersList;
