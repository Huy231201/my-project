import queryString from 'query-string';
import { api } from './api';
import { removeNullParams } from '@/utils/common';

export const Api = api.injectEndpoints({
  endpoints: builder => ({
    getWithdraw: builder.query({
      query: query => ({
        url: `/payment/withdraw?${queryString.stringify(removeNullParams(query))}`,
      }),
    }),
    getWithdrawDetail: builder.query({
      query: query => ({
        url: `/payment/withdraw/${query?.transactionId}/details`,
      }),
    }),
    getWithdrawEarn: builder.query({
      query: ({ transactionId, ...rest }) => ({
        url: `/payment/withdraw/${transactionId}/details/earned?${queryString.stringify(removeNullParams(rest))}`,
      }),
    }),
    rejectPayments: builder.mutation({
      query: payload => ({
        url: '/payment/reject',
        method: 'POST',
        data: payload,
        showToast: false,
      }),
    }),
    getWithdrawAvailable: builder.query({
      query: query => ({
        url: `/payment/withdraw/available?${queryString.stringify(removeNullParams(query))}`,
      }),
    }),
  }),
});

export const {
  useGetWithdrawQuery,
  useGetWithdrawDetailQuery,
  useGetWithdrawEarnQuery,
  useRejectPaymentsMutation,
  useGetWithdrawAvailableQuery,
} = Api;
