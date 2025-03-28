import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Çeviri dosyalarını manuel olarak içe aktarma
import translationEN from '../src/locales/en/translation.json';
import translationTR from '../src/locales/tr/translation.json';
import translationAR from '../src/locales/ar/translation.json';
import translationES from '../src/locales/es/translation.json';
import translationFR from '../src/locales/fr/translation.json';
import translationFA from '../src/locales/fa/translation.json';
import translationRU from '../src/locales/ru/translation.json';
import translationZH from '../src/locales/zh/translation.json';
import translationDE from '../src/locales/de/translation.json';

// Dil kaynakları
const resources = {
  en: {
    translation: translationEN
  },
  tr: {
    translation: translationTR
  },
  ar: {
    translation: translationAR
  },
  es: {
    translation: translationES
  },
  fr: {
    translation: translationFR
  },
  fa: {
    translation: translationFA
  },
  ru: {
    translation: translationRU
  },
  zh: {
    translation: translationZH
  },
  de: {
    translation: translationDE
  }
};

i18n
  // dil algılama
  .use(LanguageDetector)
  // react için
  .use(initReactI18next)
  // i18next başlatma
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    interpolation: {
      escapeValue: false, // react zaten XSS önlemi alıyor
    },
    
    // dil algılama seçenekleri
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage', 'cookie'],
    }
  });

export default i18n;