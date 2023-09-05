/* eslint-disable indent */
import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosRequestConfig, AxiosError } from 'axios';
import AxiosCustom from '.';

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
      const result = await AxiosCustom({
        url: baseUrl + url,
        method,
        data,
        params,
        ...rest,
      });
      return {
        data: result.data?.data === undefined ? result.data ?? {} : result.data.data,
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
