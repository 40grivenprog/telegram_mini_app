import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import GroupVisitDescription from './components/GroupVisitDescription'

interface GroupVisitDescriptionState {
  date: string
  startTime: string
  endTime: string
}

export default function GroupVisitDescriptionRoute() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useUser()

  if (!user) return null

  const state = location.state as GroupVisitDescriptionState | null

  if (!state) {
    navigate('/professional/dashboard')
    return null
  }

  const handleConfirm = () => {
    navigate('/professional/dashboard', { replace: true })
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.showAlert(t('common.groupVisitCreated'))
    }
  }

  const handleCancel = () => {
    navigate(`/professional/create-group-visit/select-time/${state.date}`)
  }

  return (
    <GroupVisitDescription
      professionalID={user.id}
      date={state.date}
      startTime={state.startTime}
      endTime={state.endTime}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  )
}
