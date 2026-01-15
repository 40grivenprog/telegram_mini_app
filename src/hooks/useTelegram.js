import { useEffect, useState } from 'react'

export function useTelegram() {
  const [tg, setTg] = useState(null)
  const [chatID, setChatID] = useState(null)
  const [theme, setTheme] = useState('light')
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const telegram = window.Telegram?.WebApp
    
    if (!telegram) {
      return
    }

    // Initialize Telegram Web App
    telegram.expand()
    telegram.enableClosingConfirmation()

    // Get chat_id
    const userData = telegram.initDataUnsafe?.user
    if (userData?.id) {
      setChatID(userData.id)
    }

    // Setup theme
    const currentTheme = telegram.colorScheme
    setTheme(currentTheme)
    updateTheme(telegram, currentTheme)

    // Listen for theme changes
    telegram.onEvent('themeChanged', () => {
      const newTheme = telegram.colorScheme
      setTheme(newTheme)
      updateTheme(telegram, newTheme)
    })

    setTg(telegram)
    setInitialized(true)
  }, [])

  const updateTheme = (tg, themeName) => {
    const colors = tg.themeParams
    document.body.className = themeName === 'dark' ? 'dark' : ''
    
    if (colors.bg_color) {
      document.documentElement.style.setProperty('--bg-color', colors.bg_color)
    }
    if (colors.text_color) {
      document.documentElement.style.setProperty('--text-color', colors.text_color)
    }
    if (colors.button_color) {
      document.documentElement.style.setProperty('--button-primary-bg', colors.button_color)
    }
    if (colors.button_text_color) {
      document.documentElement.style.setProperty('--button-text-color', colors.button_text_color)
    }
    if (colors.secondary_bg_color) {
      document.documentElement.style.setProperty('--card-bg', colors.secondary_bg_color)
    }
  }

  return { tg, chatID, theme, initialized }
}
