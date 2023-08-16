import queryString from 'query-string';
import { api } from './api';

export const Api = api.injectEndpoints({
  endpoints: builder => ({
    getOverview: builder.query({
      query: query => ({
        url: `/dashboard/overview?${queryString.stringify(query)}`,
      }),
    }),
    getMetricClick: builder.query({
      query: query => ({
        url: `/dashboard/click?${queryString.stringify(query)}`,
        providesTags: ['MetricClick'],
      }),
    }),
    getMetricDownload: builder.query({
      query: query => ({
        url: `/dashboard/download?${queryString.stringify(query)}`,
        providesTags: ['MetricDownload'],
      }),
    }),
    getMetricValidUser: builder.query({
      query: query => ({
        url: `/dashboard/valid-user?${queryString.stringify(query)}`,
        providesTags: ['MetricValidUser'],
      }),
    }),
    getMetricAffiliate: builder.query({
      query: query => ({
        url: `/dashboard/affiliate?${queryString.stringify(query)}`,
        providesTags: ['MetricAffiliate'],
      }),
    }),
  }),
});

export const {
  useGetOverviewQuery,
  useGetMetricClickQuery,
  useGetMetricDownloadQuery,
  useGetMetricValidUserQuery,
  useGetMetricAffiliateQuery,
} = Api;
