import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import SelectGroupVisitTime from './components/SelectGroupVisitTime'

export default function SelectGroupVisitTimeRoute() {
  const navigate = useNavigate()
  const { date } = useParams<{ date: string }>()
  const { user } = useUser()

  if (!user || !date) return null

  const handleSelect = (startTime: string, endTime: string) => {
    navigate('/professional/create-group-visit/description', {
      state: {
        date,
        startTime,
        endTime,
      },
    })
  }

  const handleCancel = () => {
    navigate('/professional/create-group-visit/select-date')
  }

  return (
    <SelectGroupVisitTime
      professionalID={user.id}
      date={date}
      onSelect={handleSelect}
      onCancel={handleCancel}
    />
  )
}
