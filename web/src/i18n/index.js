import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import sr from './sr.json';
import en from './en.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      sr: { translation: sr },
      en: { translation: en },
    },
    lng: 'sr',
    fallbackLng: 'sr',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
