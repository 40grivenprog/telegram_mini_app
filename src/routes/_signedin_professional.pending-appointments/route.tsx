import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import ProfessionalPendingAppointments from './components/ProfessionalPendingAppointments'

export default function ProfessionalPendingAppointmentsRoute() {
  const navigate = useNavigate()
  const { user } = useUser()

  if (!user) return null

  const handleBack = () => {
    navigate('/professional/dashboard')
  }

  return (
    <ProfessionalPendingAppointments
      onBack={handleBack}
    />
  )
}
