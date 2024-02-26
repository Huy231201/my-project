import queryString from 'query-string';
import { api } from './api';
import { removeNullParams } from '@/utils/common';

export const Api = api.injectEndpoints({
  endpoints: builder => ({
    getThreatList: builder.query({
      query: query => ({
        url: `/ThreatManagement?${queryString.stringify(removeNullParams(query))}`,
      }),
    }),
    createThreat: builder.mutation({
      query: data => ({
        url: '/ThreatManagement',
        method: 'POST',
        data,
      }),
    }),
    updateThreat: builder.mutation({
      query: data => ({
        url: '/ThreatManagement',
        method: 'POST',
        data,
      }),
    }),
    deleteThreat: builder.mutation({
      query: query => ({
        url: `/ThreatManagement?${queryString.stringify(removeNullParams(query))}`,
        method: 'DELETE',
      }),
    }),
    getThreatDetail: builder.query({
      query: query => ({
        url: `/ThreatManagement/detail?${queryString.stringify(removeNullParams(query))}`,
      }),
    }),
  }),
});

export const {
  useGetThreatListQuery,
  useCreateThreatMutation,
  useUpdateThreatMutation,
  useDeleteThreatMutation,
  useGetThreatDetailQuery,
} = Api;
