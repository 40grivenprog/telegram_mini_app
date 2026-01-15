import React from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import SelectTime from './components/SelectTime'

export default function SelectTimeRoute() {
  const navigate = useNavigate()
  const location = useLocation()
  const { professionalID, date } = useParams<{ professionalID: string; date: string }>()

  if (!professionalID || !date) return null

  const professionalName = (location.state as { professionalName?: string } | null)?.professionalName || ''

  const handleSelect = (startTime: string, endTime: string) => {
    navigate('/client/book/confirm', {
      state: {
        professionalID,
        professionalName,
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
