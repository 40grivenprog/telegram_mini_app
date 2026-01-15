import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTelegram } from '../../hooks/useTelegram'
import { useUser } from '../../contexts/UserContext'
import { apiService } from '../../services/api'
import ProfessionalSignIn from './components/ProfessionalSignIn'

export default function ProfessionalSignInRoute() {
  const navigate = useNavigate()
  const { chatID } = useTelegram()
  const { setUser } = useUser()

  if (!chatID) return null

  const handleSuccess = (userData: any) => {
    setUser(userData)
    // Set token in API service for authenticated requests
    if (userData.token) {
      apiService.setToken(userData.token)
    }
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.HapticFeedback.notificationOccurred('success')
    }
    navigate('/professional/dashboard', { replace: true })
  }

  const handleCancel = () => {
    navigate('/role-selection')
  }

  return <ProfessionalSignIn chatID={chatID} onSuccess={handleSuccess} onCancel={handleCancel} />
}
