/* eslint-disable global-require */
import i18nNext from 'i18next';
import { useEffect } from 'react';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { useTranslation, initReactI18next } from 'react-i18next';
import { LocalStorage, LOCAL_KEYS } from '@/utils/storages';

import { locale, extend } from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import updateLocale from 'dayjs/plugin/updateLocale';

extend(weekday);
extend(updateLocale);

const getLanguage = () => LocalStorage.get(LOCAL_KEYS.LANGUAGE_TOKEN) || 'en';

declare global {
  interface Window {
    I18N: unknown;
    T: (key: string, value?: object) => string;
  }
}

i18nNext
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    detection: { lookupLocalStorage: 'i18nextLng' },
    lng: getLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: require('./locales/en.json'),
      },
      vi: {
        translation: require('./locales/vi.json'),
      },
    },
  });
function I18nInstaller() {
  const { i18n, t } = useTranslation();

  window.T = t;
  window.I18N = i18n;

  useEffect(() => {
    function appHeight() {
      const doc = document.documentElement;
      doc.style.setProperty('--100vh', `${window.innerHeight}px`);
    }

    window.addEventListener('resize', appHeight);
    appHeight();

    const language = LocalStorage.get(LOCAL_KEYS.LANGUAGE_TOKEN) || 'en';
    if (i18n?.changeLanguage) {
      i18n
        .changeLanguage(language)
        .then(() => {
          LocalStorage.set(LOCAL_KEYS.LANGUAGE_TOKEN, language);
          locale(language);
        })
        .catch(error => {
          throw error;
        });
    }

    return () => {
      window.removeEventListener('resize', appHeight);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n?.changeLanguage]);

  return null;
}

export default I18nInstaller;
