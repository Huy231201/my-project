import queryString from 'query-string';
import { api } from './api';

export const Api = api.injectEndpoints({
  endpoints: builder => ({
    getUserFromEmail: builder.query({
      query: query => ({
        url: `/user?${queryString.stringify(query)}`,
      }),
    }),
    getUserInfo: builder.query({
      query: query => ({
        url: `/user/${query.id}/info`,
      }),
    }),
    getUserOverview: builder.query({
      query: query => ({
        url: `/user/${query.id}/overview`,
      }),
    }),
    getUserBalance: builder.query({
      query: query => ({
        url: `/user/${query.id}/balance`,
      }),
    }),
    getUserRecruited: builder.query({
      query: ({ id, ...rest }) => ({
        url: `/user/${id}/recruited?${queryString.stringify(rest)}`,
      }),
    }),
    getUserWithdrawHistory: builder.query({
      query: ({ id, ...rest }) => ({
        url: `/user/${id}/withdraw-history?${queryString.stringify(rest)}`,
      }),
    }),
    getUserCode: builder.query({
      query: ({ id, ...rest }) => ({
        url: `/user/${id}/code?${queryString.stringify(rest)}`,
      }),
    }),
  }),
});

export const {
  useGetUserFromEmailQuery,
  useGetUserInfoQuery,
  useGetUserOverviewQuery,
  useGetUserBalanceQuery,
  useGetUserRecruitedQuery,
  useGetUserWithdrawHistoryQuery,
  useGetUserCodeQuery,
} = Api;
