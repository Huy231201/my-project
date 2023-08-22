import queryString from 'query-string';
import { api } from './api';
import { removeNullParams } from '@/utils/common';

export const Api = api.injectEndpoints({
  endpoints: builder => ({
    getUserFromEmail: builder.query({
      query: query => ({
        url: `/user?${queryString.stringify(removeNullParams(query))}`,
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
        url: `/user/${id}/recruited?${queryString.stringify(removeNullParams(rest))}`,
      }),
    }),
    getUserWithdrawHistory: builder.query({
      query: ({ id, ...rest }) => ({
        url: `/user/${id}/withdraw-history?${queryString.stringify(removeNullParams(rest))}`,
      }),
    }),
    getUserCode: builder.query({
      query: ({ id, ...rest }) => ({
        url: `/user/${id}/code?${queryString.stringify(removeNullParams(rest))}`,
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
