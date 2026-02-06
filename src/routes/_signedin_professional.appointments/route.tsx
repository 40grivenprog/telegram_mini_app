import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import Appointments from './components/Appointments'

interface ProfessionalAppointmentsState {
  appointmentID?: string
}

export default function ProfessionalAppointmentsRoute() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useUser()

  if (!user) return null

  const state = location.state as ProfessionalAppointmentsState | null
  const appointmentID = state?.appointmentID

  const handleBack = () => {
    navigate('/professional/dashboard')
  }

  return (
    <Appointments
      onBack={handleBack}
      initialAppointmentID={appointmentID}
    />
  )
}
