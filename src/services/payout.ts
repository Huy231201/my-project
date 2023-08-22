import queryString from 'query-string';
import { api } from './api';
import { removeNullParams } from '@/utils/common';

export const Api = api.injectEndpoints({
  endpoints: builder => ({
    getPayoutList: builder.query({
      query: query => ({
        url: `/payout/list?${queryString.stringify(removeNullParams(query))}`,
      }),
    }),
    createPayout: builder.mutation({
      query: data => ({
        url: '/payout',
        method: 'POST',
        data,
      }),
    }),
    updatePayout: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/payout/${id}`,
        method: 'PUT',
        data: payload,
      }),
    }),
    getPayoutDetail: builder.query({
      query: ({ id }) => ({
        url: `/payout/${id}`,
      }),
    }),
    previewPayout: builder.query({
      query: () => ({
        url: '/payout/preview',
      }),
    }),
    approvePayout: builder.mutation({
      query: data => ({
        url: '/payout/approve',
        method: 'PUT',
        data,
      }),
    }),
    rejectPayout: builder.mutation({
      query: data => ({
        url: '/payout/reject',
        method: 'PUT',
        data,
      }),
    }),
    addPayoutTransactions: builder.mutation({
      query: data => ({
        url: '/payout/transactions/add',
        method: 'PUT',
        data,
      }),
    }),
    getPayoutTransactions: builder.query({
      query: ({ id, ...rest }) => ({
        url: `/payout/${id}/transactions?${queryString.stringify(removeNullParams(rest))}`,
      }),
    }),
    removePayoutTransaction: builder.mutation({
      query: data => ({
        url: '/payout/transactions/remove',
        method: 'PUT',
        data,
      }),
    }),
    rejectPayoutTransaction: builder.mutation({
      query: data => ({
        url: '/payout/transactions/reject',
        method: 'PUT',
        data,
      }),
    }),
  }),
});

export const {
  useGetPayoutListQuery,
  useGetPayoutDetailQuery,
  usePreviewPayoutQuery,
  useCreatePayoutMutation,
  useUpdatePayoutMutation,
  useApprovePayoutMutation,
  useRejectPayoutMutation,
  useGetPayoutTransactionsQuery,
  useAddPayoutTransactionsMutation,
  useRemovePayoutTransactionMutation,
  useRejectPayoutTransactionMutation,
} = Api;
