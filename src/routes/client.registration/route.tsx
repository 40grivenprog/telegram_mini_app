import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTelegram } from '../../hooks/useTelegram'
import { useUser } from '../../contexts/UserContext'
import { apiService } from '../../services/api'
import ClientRegistration from './components/ClientRegistration'

export default function ClientRegistrationRoute() {
  const navigate = useNavigate()
  const { chatID } = useTelegram()
  const { setUser } = useUser()

  if (!chatID) return null

  const handleSuccess = (clientData: any) => {
    setUser(clientData)
    // Set token in API service for authenticated requests
    if (clientData.token) {
      apiService.setToken(clientData.token)
    }
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.HapticFeedback.notificationOccurred('success')
    }
    navigate('/client/dashboard', { replace: true })
  }

  const handleCancel = () => {
    navigate('/role-selection')
  }

  return <ClientRegistration chatID={chatID} onSuccess={handleSuccess} onCancel={handleCancel} />
}
