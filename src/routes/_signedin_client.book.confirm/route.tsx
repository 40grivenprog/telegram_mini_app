import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import ConfirmAppointment from './components/ConfirmAppointment'

interface ConfirmAppointmentState {
  professionalID: string
  professionalName: string
  date: string
  startTime: string
  endTime: string
}


export default function ConfirmAppointmentRoute() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useUser()

  const state = location.state as ConfirmAppointmentState | null

  if (!user || !state) {
    navigate('/client/dashboard')
    return null
  }

  const handleConfirm = () => {
    navigate('/client/dashboard', { replace: true })
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.showAlert(t('common.appointmentCreated'))
    }
  }

  const handleCancel = () => {
    navigate(`/client/book/select-time/${state.professionalID}/${state.date}`)
  }

  return (
    <ConfirmAppointment
      clientID={user.id}
      professionalID={state.professionalID}
      professionalName={state.professionalName}
      date={state.date}
      startTime={state.startTime}
      endTime={state.endTime}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  )
}
