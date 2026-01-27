import { useTranslation } from 'react-i18next'
import i18n from '../i18n/config.js'

/**
 * Get current locale for date/time formatting
 * Maps i18n language codes to locale strings
 */
export const getLocale = () => {
  const lang = i18n.language || 'en'
  const localeMap = {
    'ru': 'ru-RU',
    'uk': 'uk-UA',
    'pl': 'pl-PL',
    'en': 'en-US',
  }
  return localeMap[lang] || 'en-US'
}

/**
 * Format time using current locale
 */
export const formatTime = (dateOrString, options = { hour: '2-digit', minute: '2-digit' }) => {
  const date = dateOrString instanceof Date ? dateOrString : new Date(dateOrString)
  if (isNaN(date.getTime())) {
    return String(dateOrString)
  }
  return date.toLocaleTimeString(getLocale(), options)
}

/**
 * Format date using current locale
 */
export const formatDate = (dateOrString, options = {}) => {
  const date = dateOrString instanceof Date ? dateOrString : new Date(dateOrString)
  if (isNaN(date.getTime())) {
    return String(dateOrString)
  }
  return date.toLocaleDateString(getLocale(), options)
}

/**
 * Format date and time using current locale
 */
export const formatDateTime = (dateOrString, dateOptions = {}, timeOptions = { hour: '2-digit', minute: '2-digit' }) => {
  const date = dateOrString instanceof Date ? dateOrString : new Date(dateOrString)
  if (isNaN(date.getTime())) {
    return String(dateOrString)
  }
  const dateStr = date.toLocaleDateString(getLocale(), dateOptions)
  const timeStr = date.toLocaleTimeString(getLocale(), timeOptions)
  return `${dateStr} ${timeStr}`
}

/**
 * Hook for using translations with date formatting utilities
 */
export const useI18n = () => {
  const { t, i18n } = useTranslation()
  
  return {
    t,
    locale: getLocale(),
    language: i18n.language,
    formatTime,
    formatDate,
    formatDateTime,
  }
}
