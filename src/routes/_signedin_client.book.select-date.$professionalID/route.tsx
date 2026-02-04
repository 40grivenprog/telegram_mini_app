import React from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import SelectDate from './components/SelectDate'

export default function SelectDateRoute() {
  const navigate = useNavigate()
  const location = useLocation()
  const { professionalID } = useParams<{ professionalID: string }>()

  if (!professionalID) return null

  const state = location.state as { professionalName?: string; professionalChatID?: number; professionalLocale?: string } | null
  const professionalName = state?.professionalName || ''
  const professionalChatID = state?.professionalChatID
  const professionalLocale = state?.professionalLocale || ''

  const handleSelect = (date: string) => {
    navigate(`/client/book/select-time/${professionalID}/${date}`, {
      state: { professionalName, professionalChatID, professionalLocale }
    })
  }

  const handleCancel = () => {
    navigate('/client/book/select-professional')
  }

  return <SelectDate professionalID={professionalID} onSelect={handleSelect} onCancel={handleCancel} />
}
