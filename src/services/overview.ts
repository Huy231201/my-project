import queryString from 'query-string';
import { api } from './api';
import { removeNullParams } from '@/utils/common';

export const Api = api.injectEndpoints({
  endpoints: builder => ({
    getOverviewCurrent: builder.query({
      query: () => ({
        url: '/dashboard/overview-current',
      }),
    }),
    getOverview: builder.query({
      query: query => ({
        url: `/dashboard/overview?${queryString.stringify(removeNullParams(query))}`,
      }),
    }),
    getMetricClick: builder.query({
      query: query => ({
        url: `/dashboard/click?${queryString.stringify(removeNullParams(query))}`,
        providesTags: ['MetricClick'],
      }),
    }),
    getMetricDownload: builder.query({
      query: query => ({
        url: `/dashboard/download?${queryString.stringify(removeNullParams(query))}`,
        providesTags: ['MetricDownload'],
      }),
    }),
    getMetricValidUser: builder.query({
      query: query => ({
        url: `/dashboard/valid-user?${queryString.stringify(removeNullParams(query))}`,
        providesTags: ['MetricValidUser'],
      }),
    }),
    getMetricAffiliate: builder.query({
      query: query => ({
        url: `/dashboard/affiliate?${queryString.stringify(removeNullParams(query))}`,
        providesTags: ['MetricAffiliate'],
      }),
    }),
  }),
});

export const {
  useGetOverviewCurrentQuery,
  useGetOverviewQuery,
  useGetMetricClickQuery,
  useGetMetricDownloadQuery,
  useGetMetricValidUserQuery,
  useGetMetricAffiliateQuery,
} = Api;
