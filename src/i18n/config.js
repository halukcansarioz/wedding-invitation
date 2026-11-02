import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Ekstra npm paketi kurmaya gerek kalmadan kendi yazdığımız Lazy Load mekanizması
const localeModules = import.meta.glob("./locales/*.json");
export const normalizeLanguage = (language) => language.toLowerCase().split("-")[0];

const lazyLoadBackend = {
  type: 'backend',
  read: (language, namespace, callback) => {
    const normalizedLanguage = normalizeLanguage(language);
    const localePath = `./locales/${normalizedLanguage}.json`;
    const loadLocale = localeModules[localePath];

    if (!loadLocale) {
      callback(new Error(`Desteklenmeyen dil: ${language}`), null);
      return;
    }

    loadLocale()
      .then((resources) => {
        callback(null, resources.default || resources);
      })
      .catch((error) => {
        console.error(`Dil dosyası yüklenemedi: ${language}`, error);
        callback(error, null);
      });
  }
};

i18n
  .use(lazyLoadBackend)
  .use(LanguageDetector) 
  .use(initReactI18next)
  .init({
    fallbackLng: 'tr', 
    debug: false,
    interpolation: {
      escapeValue: false, 
    }
  });

export default i18n;