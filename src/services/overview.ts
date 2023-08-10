import queryString from 'query-string';
import { api } from './api';

export const OverviewApi = api.injectEndpoints({
  endpoints: builder => ({
    getMetric: builder.query({
      query: () => ({
        url: '/metric',
        providesTags: ['Metrics'],
      }),
    }),
    getMetricDetail: builder.query({
      query: query => ({
        url: `/metric/details?${queryString.stringify(query)}`,
      }),
    }),
  }),
});

export const { useGetMetricQuery, useGetMetricDetailQuery } = OverviewApi;
