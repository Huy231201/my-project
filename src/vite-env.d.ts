/// <reference types="vite/client" />
declare global {
  interface Window {
    I18N: unknown;
    T: (key: string, value?: object) => string;
  }
}
