import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import PreviousAppointments from './components/PreviousAppointments'

export default function PreviousAppointmentsRoute() {
  const navigate = useNavigate()
  const { user } = useUser()

  if (!user) return null

  const handleBack = () => {
    navigate('/professional/dashboard')
  }

  return (
    <PreviousAppointments
      onBack={handleBack}
    />
  )
}
