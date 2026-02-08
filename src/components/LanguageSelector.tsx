import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from '../i18n/config'
import './LanguageSelector.css'

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        HapticFeedback: {
          notificationOccurred: (type: string) => void
        }
      }
    }
  }
}

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇭🇳' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
]

interface LanguageSelectorProps {
  onLocaleChange?: (locale: string) => Promise<void>
}

export default function LanguageSelector({ onLocaleChange }: LanguageSelectorProps) {
  const { i18n: i18nInstance } = useTranslation()
  const currentLanguage = i18nInstance.language.split('-')[0]
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0]

  const handleLanguageChange = async (langCode: string) => {
    setIsUpdating(true)
    try {
      // Update i18n immediately for better UX
      i18n.changeLanguage(langCode)
      setIsOpen(false)
      
      // If callback provided (user is logged in), update locale on server
      if (onLocaleChange) {
        await onLocaleChange(langCode)
      }
      
      // Trigger haptic feedback if available
      const tg = window.Telegram?.WebApp
      if (tg) {
        tg.HapticFeedback.notificationOccurred('success')
      }
    } catch (error) {
      console.error('Failed to update locale:', error)
      // Revert to previous language on error
      const previousLang = currentLanguage
      i18n.changeLanguage(previousLang)
    } finally {
      setIsUpdating(false)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="language-selector-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="language-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={i18nInstance.t('common.language')}
        title={currentLang.name}
        disabled={isUpdating}
      >
        <span className="language-flag-icon">{currentLang.flag}</span>
        {isUpdating && <span className="language-loading">...</span>}
      </button>
      
      {isOpen && (
        <div className="language-dropdown-menu">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              className={`language-dropdown-item ${currentLanguage === lang.code ? 'active' : ''}`}
              onClick={() => handleLanguageChange(lang.code)}
              disabled={isUpdating}
            >
              <span className="language-flag">{lang.flag}</span>
              <span className="language-name">{lang.name}</span>
              {currentLanguage === lang.code && (
                <span className="language-check">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
