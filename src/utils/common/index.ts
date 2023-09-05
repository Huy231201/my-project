import { LocalStorage, SessionStorage, LOCAL_KEYS } from '../storages';

interface CredentialsType {
  accessToken: string;
  refreshToken: string;
  expiration: string;
}

export const getAccessToken = () =>
  LocalStorage.get(LOCAL_KEYS.ACCESS_TOKEN) || SessionStorage.get(LOCAL_KEYS.ACCESS_TOKEN);

export const setCredential = (credentials: CredentialsType) => {
  const { accessToken, refreshToken, expiration } = credentials || {
    accessToken: '',
    refreshToken: '',
    expiration: '',
  };
  if (!accessToken || !refreshToken) {
    throw new Error('Missing data');
  }
  LocalStorage.set(LOCAL_KEYS.ACCESS_TOKEN, accessToken);
  LocalStorage.set(LOCAL_KEYS.REFRESH_TOKEN, refreshToken);
  LocalStorage.set(LOCAL_KEYS.EXPIRATION_TOKEN, expiration);
};

export function numberWithCommas(x = 0) {
  const fixedX = Number(Number(x).toFixed(2));
  return fixedX.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export const validateEmail = (email = '') =>
  !!String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );

export const renderTotal = (total: number, afterText: string) => {
  if (total < 1) {
    return `${total} ${afterText}`;
  }
  return `${numberWithCommas(total)} ${afterText}s`;
};

export function capitalizeFirstLetter(string = '') {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

export const removeNullParams = (params: { [key: string]: string | number | boolean | undefined }) =>
  Object.keys(params).reduce((object: any, key: string) => {
    const newObject = {
      ...object,
    };
    if (params?.[key] !== undefined && params?.[key] !== null && params?.[key] !== '') {
      newObject[key] = params[key];
    }
    return newObject;
  }, {});

export const truncateStr = (str: string | undefined | null = '', maxLength = 13) => {
  const strValue = str || '';
  return strValue.length > maxLength
    ? `${strValue.slice(0, (maxLength - 3) / 2)}…${strValue.slice(-(maxLength - 3) / 2)}`
    : strValue;
};
