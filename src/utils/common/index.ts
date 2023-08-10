import { LocalStorage, SessionStorage, LOCAL_KEYS } from '../storages';

interface CredentialsType {
  accessToken: string;
  refreshToken: string;
  expiration: string;
}

export const getAccessToken = () =>
  LocalStorage.get(LOCAL_KEYS.ACCESS_TOKEN) || SessionStorage.get(LOCAL_KEYS.ACCESS_TOKEN);

export const setCredential = (credentials: CredentialsType) => {
  const { accessToken, refreshToken, expiration } = credentials;
  if (!accessToken || !refreshToken) {
    throw new Error('Missing data');
  }
  LocalStorage.set(LOCAL_KEYS.ACCESS_TOKEN, accessToken);
  LocalStorage.set(LOCAL_KEYS.REFRESH_TOKEN, refreshToken);
  LocalStorage.set(LOCAL_KEYS.EXPIRATION_TOKEN, expiration);
};
