import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '../axios/axiosBaseQuery';

export const api = createApi({
  keepUnusedDataFor: 0,
  baseQuery: axiosBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
  }),
  endpoints: () => ({}),
});
