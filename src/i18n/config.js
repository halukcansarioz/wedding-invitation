import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import trTranslation from './locales/tr.json';
import enTranslation from './locales/en.json';

i18n
  .use(LanguageDetector) // Tarayıcı dilini otomatik algılar
  .use(initReactI18next)
  .init({
    resources: {
      tr: { translation: trTranslation },
      en: { translation: enTranslation }
    },
    fallbackLng: 'tr', // Varsayılan dil
    debug: false,
    interpolation: {
      escapeValue: false, // React zaten XSS koruması sağlıyor
    }
  });

export default i18n;