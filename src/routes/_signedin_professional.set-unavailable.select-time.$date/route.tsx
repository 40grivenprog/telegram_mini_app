import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import SelectUnavailableTime from './components/SelectUnavailableTime'

export default function SelectUnavailableTimeRoute() {
  const navigate = useNavigate()
  const { date } = useParams<{ date: string }>()
  const { user } = useUser()

  if (!user || !date) return null

  const handleSelect = (startTime: string, endTime: string) => {
    navigate('/professional/set-unavailable/description', {
      state: {
        date,
        startTime,
        endTime,
      },
    })
  }

  const handleCancel = () => {
    navigate('/professional/set-unavailable/select-date')
  }

  return (
    <SelectUnavailableTime
      professionalID={user.id}
      date={date}
      onSelect={handleSelect}
      onCancel={handleCancel}
    />
  )
}
