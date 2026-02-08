import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import { apiService } from '../../services/api'
import { useClientInvites } from '../_signedin_client.invites/hooks/useClientInvites'
import ClientDashboard from './components/ClientDashboard'

export default function ClientDashboardRoute() {
  const navigate = useNavigate()
  const { user } = useUser()
  const { invites } = useClientInvites()

  if (!user) return null

  const handleBookAppointment = () => {
    navigate('/client/book')
  }

  const handleViewAppointments = () => {
    navigate('/client/appointments')
  }

  const handleViewProfessionals = () => {
    navigate('/client/professionals')
  }

  const handleViewInvites = () => {
    navigate('/client/invites')
  }

  const handleViewPreviousAppointments = () => {
    navigate('/client/previous-appointments')
  }

  const handleViewPackages = () => {
    navigate('/client/packages')
  }

  const handleLocaleChange = async (locale: string) => {
    await apiService.updateClientLocale(locale)
  }

  return (
    <ClientDashboard 
      user={user} 
      onBookAppointment={handleBookAppointment}
      onViewAppointments={handleViewAppointments}
      onViewProfessionals={handleViewProfessionals}
      onViewInvites={handleViewInvites}
      onViewPreviousAppointments={handleViewPreviousAppointments}
      onViewPackages={handleViewPackages}
      onLocaleChange={handleLocaleChange}
      invitesCount={invites.length}
    />
  )
}
