import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import UnavailableDescription from './components/UnavailableDescription'

interface UnavailableDescriptionState {
  date: string
  startTime: string
  endTime: string
}

export default function UnavailableDescriptionRoute() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useUser()

  if (!user) return null

  const state = location.state as UnavailableDescriptionState | null

  if (!state) {
    navigate('/professional/dashboard')
    return null
  }

  const handleConfirm = () => {
    navigate('/professional/dashboard', { replace: true })
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.showAlert(t('common.unavailableCreated'))
    }
  }

  const handleCancel = () => {
    navigate(`/professional/set-unavailable/select-time/${state.date}`)
  }

  return (
    <UnavailableDescription
      professionalID={user.id}
      date={state.date}
      startTime={state.startTime}
      endTime={state.endTime}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  )
}
