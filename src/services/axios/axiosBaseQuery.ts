/* eslint-disable indent */
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosRequestConfig, AxiosError } from 'axios';
import axios from '.';

interface Props {
  url?: string;
  method?: AxiosRequestConfig['method'];
  data?: AxiosRequestConfig['data'];
  params?: AxiosRequestConfig['params'];
  showToast?: boolean;
}

const axiosBaseQuery =
  ({ baseUrl }: { baseUrl: string } = { baseUrl: '' }): BaseQueryFn<Props, unknown, unknown> =>
  async ({ url, method, data, params, ...rest }) => {
    try {
      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
        ...rest,
      });
      return {
        data: result.data?.data || result.data || {},
      };
    } catch (axiosError) {
      const err = axiosError as AxiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };

export default axiosBaseQuery;
