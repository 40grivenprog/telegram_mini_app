import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import ClientAppointments from './components/ClientAppointments'

export default function ClientAppointmentsRoute() {
  const navigate = useNavigate()
  const { status } = useParams<{ status: string }>()
  const { user } = useUser()

  if (!user) return null

  const validStatus = status === 'pending' || status === 'upcoming' ? status : ''

  const handleBack = () => {
    navigate('/client/dashboard')
  }

  return (
    <ClientAppointments
      status={validStatus}
      onBack={handleBack}
    />
  )
}
