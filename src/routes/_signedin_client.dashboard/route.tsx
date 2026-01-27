import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import { apiService } from '../../services/api'
import ClientDashboard from './components/ClientDashboard'

export default function ClientDashboardRoute() {
  const navigate = useNavigate()
  const { user } = useUser()

  if (!user) return null

  const handleBookAppointment = () => {
    navigate('/client/book/select-professional')
  }

  const handleViewPendingAppointments = () => {
    navigate('/client/appointments/pending')
  }

  const handleViewUpcomingAppointments = () => {
    navigate('/client/appointments/upcoming')
  }

  const handleLocaleChange = async (locale: string) => {
    await apiService.updateClientLocale(locale)
  }

  return (
    <ClientDashboard 
      user={user} 
      onBookAppointment={handleBookAppointment}
      onViewPendingAppointments={handleViewPendingAppointments}
      onViewUpcomingAppointments={handleViewUpcomingAppointments}
      onLocaleChange={handleLocaleChange}
    />
  )
}
