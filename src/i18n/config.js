import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Ekstra npm paketi kurmaya gerek kalmadan kendi yazdığımız Lazy Load mekanizması
const lazyLoadBackend = {
  type: 'backend',
  read: (language, namespace, callback) => {
    import(`./locales/${language}.json`)
      .then((resources) => {
        // Dosya başarıyla yüklendiğinde i18next'e bildir
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