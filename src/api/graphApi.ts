import { createApi } from '@reduxjs/toolkit/query/react';
import { GraphQLClient } from 'graphql-request';

import { graphqlRequestBaseQuery } from './graphqlRequestBaseQuery';

export const client = new GraphQLClient('/api/graph');

if (window.location.hash.length > 1) {
  localStorage.setItem('token', window.location.hash.substring(1));
  window.location.hash = '';
}

export const api = createApi({
  baseQuery: graphqlRequestBaseQuery({
    options: {
      client,
    },
    prepareHeaders: headers => {
      const token = localStorage.getItem('token');
      headers.set('Authorization', `Bearer ${token}`);

      return headers;
    }
  }),
  refetchOnMountOrArgChange: true,
  endpoints: () => ({})
});
