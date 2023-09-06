import axios, { AxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
import { LocalStorage, LOCAL_KEYS } from '@/utils/storages';
import { getAccessToken, setCredential } from '@/utils/common';

const abortController = new AbortController();
export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  showToast?: boolean;
}

const NUMBER_RETRIES = 3;
let retryCount = 0;
let retryMethod: Promise<string> | null = null;
let tmpNewAccessToken: string | null = null;

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

function sleep(delay = 2000): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, delay));
}

function sleepRefreshToken(delay = 50, firstResolve?: (value: string) => void) {
  setTimeout(() => new Promise(resolve => resolve(null)), 10000);
  return new Promise(resolve =>
    setTimeout(async () => {
      const currentResolve = firstResolve || resolve;
      if (tmpNewAccessToken) {
        currentResolve(tmpNewAccessToken);
      } else {
        await sleepRefreshToken(delay, currentResolve);
      }
    }, delay),
  );
}

export function resetRetry() {
  retryCount = 0;
  retryMethod = null;
  tmpNewAccessToken = null;
}

const refresh = async (accessToken: string, refreshToken: string) => {
  try {
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
    const results = res?.data?.data || res?.data || {};
    setCredential(results);
    return Promise.resolve(results?.accessToken);
  } catch (error) {
    LocalStorage.clearAll();
    window.location.href = '/login';
    return Promise.reject(error);
  }
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
  const refreshToken = LocalStorage.get(LOCAL_KEYS.REFRESH_TOKEN);
  const expiration = LocalStorage.get(LOCAL_KEYS.EXPIRATION_TOKEN);

  const newConfig = {
    ...config,
    headers: {
      ...config.headers,
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      'accept-language': languageCode,
      'show-toast': config?.showToast !== undefined ? config.showToast : true,
    },
  };

  const isExpired = Date.now() >= new Date(expiration).getTime();
  if (isExpired) {
    if (refreshToken && accessToken && !retryMethod) {
      retryCount += 1;
      retryMethod = refresh(accessToken, refreshToken)
        .finally(() => {
          retryMethod = null;
        })
        .catch(error => Promise.reject(error));
      const token = await retryMethod;
      tmpNewAccessToken = token;
      newConfig.headers.Authorization = `Bearer ${token}`;
      return newConfig;
    }
    const res = await sleepRefreshToken();
    const newAccessTokenToken = res;
    resetRetry();
    if (newAccessTokenToken) {
      return {
        ...config,
        headers: {
          ...config.headers,
          ...(newAccessTokenToken && { Authorization: `Bearer ${newAccessTokenToken}` }),
          'accept-language': languageCode,
          'show-toast': config?.showToast !== undefined ? config.showToast : true,
        },
      };
    }
    abortController.abort();
  }
  return newConfig;
});

instance.interceptors.response.use(
  resp => {
    if (resp?.data?.success === false) {
      const showToast = resp.config.headers['show-toast'];
      const errorMessage = resp?.data?.message || 'Something went wrong!';
      if (showToast) {
        toast.error(errorMessage);
      }
    }
    return resp;
  },
  async err => {
    const origReqConfig = err.config;
    if (err?.response?.status >= 500 && retryCount < NUMBER_RETRIES) {
      retryCount += 1;
      return sleep(timeDelay(retryCount)).then(() => instance.request(origReqConfig));
    }

    if (err?.response?.status === 401) {
      const accessToken = getAccessToken();
      const refreshToken = LocalStorage.get(LOCAL_KEYS.REFRESH_TOKEN) || '';
      if (refreshToken && !retryMethod && retryCount < NUMBER_RETRIES) {
        retryCount += 1;
        delete origReqConfig.headers.Authorization;

        retryMethod = refresh(accessToken, refreshToken)
          .finally(() => {
            retryMethod = null;
          })
          .catch(error => Promise.reject(error));
        const token = await retryMethod;
        tmpNewAccessToken = token;
        origReqConfig.headers.Authorization = `Bearer ${token}`;
        return instance(origReqConfig);
      }
      const res = await sleepRefreshToken();
      const newAccessTokenToken = res;
      resetRetry();
      if (newAccessTokenToken) {
        origReqConfig.headers.Authorization = `Bearer ${newAccessTokenToken}`;
        return instance(origReqConfig);
      }
      abortController.abort();
    }
    const showToast = err?.config?.headers?.['show-toast'];
    const errorMessage = err?.response?.data || {};
    if (err?.response && showToast) {
      toast.error(errorMessage.detail || errorMessage.message || errorMessage.error || 'Something went wrong!');
    }
    throw errorMessage;
  },
);

export default instance;
