import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import viAuth from "./locales/vi/auth.json";
import enAuth from "./locales/en/auth.json";
import viCommon from "./locales/vi/common.json";
import enCommon from "./locales/en/common.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: {
        common: viCommon,
        auth: viAuth,
      },
      en: {
        common: enCommon,
        auth: enAuth,
      },
    },

    supportedLngs: ["vi", "en"],
    fallbackLng: "vi",
    defaultNS: "common",

    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },

    interpolation: {
      escapeValue: false,
    },
  });

i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
});

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: { common: typeof viCommon; auth: typeof viAuth };
  }
}

export default i18n;
