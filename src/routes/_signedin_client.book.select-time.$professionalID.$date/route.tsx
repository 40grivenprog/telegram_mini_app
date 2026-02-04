import React from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import SelectTime from './components/SelectTime'

export default function SelectTimeRoute() {
  const navigate = useNavigate()
  const location = useLocation()
  const { professionalID, date } = useParams<{ professionalID: string; date: string }>()

  if (!professionalID || !date) return null

  const state = location.state as { professionalName?: string; professionalChatID?: number; professionalLocale?: string } | null
  const professionalName = state?.professionalName || ''
  const professionalChatID = state?.professionalChatID
  const professionalLocale = state?.professionalLocale || ''

  const handleSelect = (startTime: string, endTime: string) => {
    if (!professionalChatID || !professionalLocale) {
      console.error('Missing professional chat_id or locale')
      return
    }
    navigate('/client/book/confirm', {
      state: {
        professionalID,
        professionalName,
        professionalChatID,
        professionalLocale,
        date,
        startTime,
        endTime
      }
    })
  }

  const handleCancel = () => {
    navigate(`/client/book/select-date/${professionalID}`)
  }

  return <SelectTime professionalID={professionalID} date={date} onSelect={handleSelect} onCancel={handleCancel} />
}
