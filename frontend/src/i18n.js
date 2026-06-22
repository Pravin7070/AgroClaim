import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en.json';
import taTranslation from './locales/ta.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: enTranslation
            },
            ta: {
                translation: taTranslation
            }
        },
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        },
        detection: {
            order: ['localStorage', 'cookie', 'htmlTag', 'path', 'subdomain'],
            caches: ['localStorage', 'cookie']
        }
    });

// Set initial document lang attribute
i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng;
});

// Set on initialization
document.documentElement.lang = i18n.language;

export default i18n;
