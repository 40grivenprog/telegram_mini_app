import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import ProfessionalPendingAppointments from './components/ProfessionalAppointments'

export default function ProfessionalAppointmentsRoute() {
  const navigate = useNavigate()
  const { status } = useParams<{ status: string }>()
  const { user } = useUser()

  if (!user) return null

  const validStatus = status === 'pending' || status === 'upcoming' ? status : ''

  const handleBack = () => {
    navigate('/professional/dashboard')
  }

  return (
    <ProfessionalPendingAppointments
      status={validStatus}
      onBack={handleBack}
    />
  )
}
