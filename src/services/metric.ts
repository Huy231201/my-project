import queryString from 'query-string';
import { api } from './api';
import { removeNullParams } from '@/utils/common';

export const Api = api.injectEndpoints({
  endpoints: builder => ({
    getMetric: builder.query({
      query: () => ({
        url: '/metric',
        providesTags: ['Metrics'],
      }),
    }),
    getMetricDetail: builder.query({
      query: query => ({
        url: `/metric/details?${queryString.stringify(removeNullParams(query))}`,
      }),
    }),
  }),
});

export const { useGetMetricQuery, useGetMetricDetailQuery } = Api;
