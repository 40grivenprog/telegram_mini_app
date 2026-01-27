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

// Function to detect initial language
// Priority: localStorage (user's manual selection) > browser language > default
const detectInitialLanguage = () => {
  // Priority 1: Check localStorage for saved user preference
  if (typeof window !== 'undefined') {
    const savedLang = localStorage.getItem('i18nextLng')
    if (savedLang) {
      const langPrefix = savedLang.split('-')[0].toLowerCase()
      const supportedLangs = ['en', 'ru', 'uk', 'pl']
      if (supportedLangs.includes(langPrefix)) {
        return langPrefix
      }
    }
  }
  
  // Priority 2: Fallback to browser language
  if (typeof window !== 'undefined') {
    const browserLang = navigator.language || navigator.userLanguage || 'en'
    const browserLangPrefix = browserLang.split('-')[0].toLowerCase()
    const supportedLangs = ['en', 'ru', 'uk', 'pl']
    
    if (supportedLangs.includes(browserLangPrefix)) {
      return browserLangPrefix
    }
  }
  
  // Default to English
  return 'en'
}

// Get initial language
const initialLang = detectInitialLanguage()

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
    lng: initialLang, // Set initial language
    fallbackLng: 'en',
    supportedLngs: supportedLanguages,
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      // Prioritize localStorage (user's manual selection via language selector)
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      // Only check supported languages
      checkWhitelist: true,
    },
  })

// Set initial language if not already saved
// User can change it via language selector, which will save to localStorage
if (!localStorage.getItem('i18nextLng') && initialLang && supportedLanguages.includes(initialLang)) {
  i18n.changeLanguage(initialLang)
}

export default i18n
