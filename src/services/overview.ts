import queryString from 'query-string';
import { api } from './api';

interface Response {
  data: any;
}

export const MetricApi = api.injectEndpoints({
  endpoints: builder => ({
    getOverview: builder.query({
      query: query => ({
        url: `/dashboard/overview?${queryString.stringify(query)}`,
      }),
      transformResponse: (response: Response) => response.data,
    }),
    getMetricClick: builder.query({
      query: query => ({
        url: `/dashboard/click?${queryString.stringify(query)}`,
        providesTags: ['MetricClick'],
      }),
      transformResponse: (response: Response) => response.data,
    }),
    getMetricDownload: builder.query({
      query: query => ({
        url: `/dashboard/download?${queryString.stringify(query)}`,
        providesTags: ['MetricDownload'],
      }),
      transformResponse: (response: Response) => response.data,
    }),
    getMetricValidUser: builder.query({
      query: query => ({
        url: `/dashboard/valid-user?${queryString.stringify(query)}`,
        providesTags: ['MetricValidUser'],
      }),
      transformResponse: (response: Response) => response.data,
    }),
    getMetricAffiliate: builder.query({
      query: query => ({
        url: `/dashboard/affiliate?${queryString.stringify(query)}`,
        providesTags: ['MetricAffiliate'],
      }),
      transformResponse: (response: Response) => response.data,
    }),
  }),
});

export const {
  useGetOverviewQuery,
  useGetMetricClickQuery,
  useGetMetricDownloadQuery,
  useGetMetricValidUserQuery,
  useGetMetricAffiliateQuery,
} = MetricApi;
