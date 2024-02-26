import queryString from 'query-string';
import { api } from './api';
import { removeNullParams } from '@/utils/common';

export const Api = api.injectEndpoints({
  endpoints: builder => ({
    getTokenList: builder.query({
      query: query => ({
        url: `/Wallet/token?${queryString.stringify(removeNullParams(query))}`,
      }),
    }),
    createToken: builder.mutation({
      query: data => ({
        url: '/Wallet/token',
        method: 'POST',
        contentType: 'multipart/form-data',
        data,
      }),
    }),
    getTokenDetails: builder.mutation({
      query: ({ chainId, address }) => ({
        url: `/Wallet/token/${chainId}/${address}`,
      }),
    }),
    updateToken: builder.mutation({
      query: data => ({
        url: '/Wallet/token',
        method: 'POST',
        contentType: 'multipart/form-data',
        data,
      }),
    }),
    deleteToken: builder.mutation({
      query: ({ chainId, address }) => ({
        url: `/Wallet/token/${chainId}/${address}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetTokenListQuery,
  useCreateTokenMutation,
  useGetTokenDetailsMutation,
  useUpdateTokenMutation,
  useDeleteTokenMutation,
} = Api;
