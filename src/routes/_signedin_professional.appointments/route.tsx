import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import Appointments from './components/Appointments'

export default function ProfessionalAppointmentsRoute() {
  const navigate = useNavigate()
  const { user } = useUser()

  if (!user) return null

  const handleBack = () => {
    navigate('/professional/dashboard')
  }

  return (
    <Appointments
      onBack={handleBack}
    />
  )
}
