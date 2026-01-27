import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translation files
import enTranslations from './locales/en.json'
import ruTranslations from './locales/ru.json'
import ukTranslations from './locales/uk.json'
import plTranslations from './locales/pl.json'

// Supported languages
const supportedLanguages = ['en', 'ru', 'uk', 'pl']

// Function to detect language from Telegram WebApp
const detectTelegramLanguage = () => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    const languageCode = window.Telegram.WebApp.initDataUnsafe?.user?.language_code
    console.log('languageCode', languageCode)
    
    if (languageCode) {
      // Map Telegram language codes to our supported languages
      const langMap = {
        'ru': 'ru',
        'uk': 'uk',
        'pl': 'pl',
        'en': 'en',
        // Handle language variants
        'ru-RU': 'ru',
        'uk-UA': 'uk',
        'pl-PL': 'pl',
        'en-US': 'en',
        'en-GB': 'en',
      }
      
      // Check exact match first
      if (langMap[languageCode]) {
        return langMap[languageCode]
      }
      
      // Check first two characters (e.g., 'ru' from 'ru-RU')
      const langPrefix = languageCode.split('-')[0].toLowerCase()
      if (langMap[langPrefix]) {
        return langMap[langPrefix]
      }
    }
  }
  
  // Fallback to browser language or default
  const browserLang = navigator.language || navigator.userLanguage || 'en'
  const browserLangPrefix = browserLang.split('-')[0].toLowerCase()
  const supportedLangs = ['en', 'ru', 'uk', 'pl']
  
  if (supportedLangs.includes(browserLangPrefix)) {
    return browserLangPrefix
  }
  
  return 'en'
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      ru: { translation: ruTranslations },
      uk: { translation: ukTranslations },
      pl: { translation: plTranslations },
    },
    lng: detectTelegramLanguage(),
    fallbackLng: 'en',
    supportedLngs: supportedLanguages,
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      // Custom detection order
      order: ['custom', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  })

// Override language detection with Telegram language
const telegramLang = detectTelegramLanguage()
if (telegramLang && supportedLanguages.includes(telegramLang)) {
  i18n.changeLanguage(telegramLang)
}

export default i18n
