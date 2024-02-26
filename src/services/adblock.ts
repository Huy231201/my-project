import { api } from './api';

export const Api = api.injectEndpoints({
  endpoints: builder => ({
    getAdblockList: builder.query({
      query: () => ({
        url: '/AdBlock?canDownload=false',
      }),
    }),
    updateAdblockList: builder.mutation({
      query: data => ({
        url: '/AdBlock',
        method: 'POST',
        data,
        maxBodyLength: Infinity,
      }),
    }),
  }),
});

export const { useGetAdblockListQuery, useUpdateAdblockListMutation } = Api;
