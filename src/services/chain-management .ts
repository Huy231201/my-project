import queryString from 'query-string';
import { api } from './api';
import { removeNullParams } from '@/utils/common';

export const Api = api.injectEndpoints({
  endpoints: builder => ({
    getChainList: builder.query({
      query: query => ({
        url: `/Wallet/chain?${queryString.stringify(removeNullParams(query))}`,
      }),
    }),
    addChainData: builder.mutation({
      query: data => ({
        url: '/Wallet/chain',
        method: 'POST',
        data,
      }),
    }),
    getChainDetails: builder.query({
      query: ({ chainId }) => ({
        url: `/Wallet/chain/${chainId}`,
      }),
    }),
    updateChain: builder.mutation({
      query: data => ({
        url: '/Wallet/chain',
        method: 'POST',
        data,
      }),
    }),
    deleteChain: builder.mutation({
      query: ({ chainId }) => ({
        url: `/Wallet/chain/${chainId}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetChainListQuery,
  useAddChainDataMutation,
  useGetChainDetailsQuery,
  useUpdateChainMutation,
  useDeleteChainMutation,
} = Api;
