import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import ProfessionalDashboard from './components/ProfessionalDashboard'

export default function ProfessionalDashboardRoute() {
  const navigate = useNavigate()
  const { user } = useUser()

  if (!user) return null

  const handleViewPendingAppointments = () => {
    navigate('/professional/pending-appointments')
  }

  return (
    <ProfessionalDashboard
      user={user}
      onViewPendingAppointments={handleViewPendingAppointments}
    />
  )
}
