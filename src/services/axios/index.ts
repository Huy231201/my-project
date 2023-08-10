import axios, { AxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';
import { LocalStorage, LOCAL_KEYS } from '@/utils/storages';
import { getAccessToken, setCredential } from '@/utils/common';

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  showToast?: boolean;
}

const NUMBER_RETRIES = 3;
let retryCount = 0;
let retryMethod = null;

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function timeDelay(k: number) {
  const baseInterval = 0.5;
  const baseMultiplier = 1.5;
  const retryInterval = baseInterval * baseMultiplier ** (k - 1) * 1000;
  const max = k === NUMBER_RETRIES ? 500 : retryInterval;
  return retryInterval + randomInt(0, max);
}

function wait(delay: number) {
  return new Promise(resolve => setTimeout(resolve, delay));
}

export function resetRetry() {
  retryCount = 0;
  retryMethod = null;
}

const refresh = async (accessToken: string, refreshToken: string) => {
  const params = {
    accessToken,
    refreshToken,
  };
  const headers = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh-token`, params, headers);
  setCredential(res?.data);
  return Promise.resolve(accessToken);
};

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(async (config: CustomAxiosRequestConfig) => {
  // Attach auth header using token from local storage
  const accessToken = getAccessToken();
  const languageCode = LocalStorage.get(LOCAL_KEYS.LANGUAGE_TOKEN, 'en');

  return {
    ...config,
    headers: {
      ...config.headers,
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      'accept-language': languageCode,
      'show-toast': config?.showToast !== undefined ? config.showToast : true,
    },
  };
});

instance.interceptors.response.use(
  resp => resp,
  async err => {
    const origReqConfig = err.config;
    if (err.response.status >= 500 && retryCount < NUMBER_RETRIES - 1) {
      retryCount += 1;
      return wait(timeDelay(retryCount)).then(() => instance.request(origReqConfig));
    }

    if (err.response.status === 401) {
      const accessToken = getAccessToken();
      const refreshToken = LocalStorage.get(LOCAL_KEYS.REFRESH_TOKEN) || '';
      if (refreshToken && retryCount < NUMBER_RETRIES - 1) {
        retryCount += 1;
        // delete origReqConfig.headers['Authorization']

        retryMethod = refresh(accessToken, refreshToken)
          .finally(() => {
            retryMethod = null;
          })
          .catch(error => Promise.reject(error));

        return retryMethod.then(token => {
          origReqConfig.headers.Authorization = `Bearer ${token}`;
          return instance.request(origReqConfig);
        });
      }
      resetRetry();
    } else {
      const showToast = err.config.headers['show-toast'];
      const errorMessage = err?.response?.data;
      if (showToast) {
        toast.error(errorMessage.message || errorMessage.error || 'Something went wrong!');
      }
      throw errorMessage;
    }

    return Promise.reject(err);
  },
);

export default instance;
