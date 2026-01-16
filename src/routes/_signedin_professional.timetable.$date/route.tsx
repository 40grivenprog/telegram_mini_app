import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import Timetable from './components/Timetable'

export default function TimetableRoute() {
  const navigate = useNavigate()
  const { date } = useParams<{ date: string }>()
  const { user } = useUser()

  if (!user || !date) return null

  const handleBack = () => {
    navigate('/professional/dashboard')
  }

  const handleDateChange = (newDate: string) => {
    navigate(`/professional/timetable/${newDate}`, { replace: true })
  }

  return (
    <Timetable
      professionalID={user.id}
      date={date}
      onBack={handleBack}
      onDateChange={handleDateChange}
    />
  )
}
