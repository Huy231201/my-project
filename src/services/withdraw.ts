import queryString from 'query-string';
import { api } from './api';

export const Api = api.injectEndpoints({
  endpoints: builder => ({
    getWithdraw: builder.query({
      query: query => ({
        url: `/payment/withdraw?${queryString.stringify(query)}`,
      }),
    }),
    getWithdrawDetail: builder.query({
      query: ({ id, ...rest }) => ({
        url: `/payment/withdraw/${id}/details?${queryString.stringify(rest)}`,
      }),
    }),
    getWithdrawCount: builder.query({
      query: query => ({
        url: `/payment/withdraw-count?${queryString.stringify(query)}`,
      }),
    }),
  }),
});

export const { useGetWithdrawQuery, useGetWithdrawDetailQuery, useGetWithdrawCountQuery } = Api;
