import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import { apiService } from '../../services/api'
import ProfessionalDashboard from './components/ProfessionalDashboard'

export default function ProfessionalDashboardRoute() {
  const navigate = useNavigate()
  const { user } = useUser()

  if (!user) return null

  const handleViewPendingAppointments = () => {
    navigate('/professional/appointments/pending')
  }

  const handleViewUpcomingAppointments = () => {
    navigate('/professional/appointments/upcoming')
  }

  const handleSetUnavailable = () => {
    navigate('/professional/set-unavailable/select-date')
  }

  const handleViewTimetable = () => {
    const today = new Date().toISOString().split('T')[0]
    navigate(`/professional/timetable/${today}`)
  }

  const handleViewPreviousAppointments = () => {
    navigate('/professional/previous-appointments/select-client')
  }

  const handleLocaleChange = async (locale: string) => {
    await apiService.updateProfessionalLocale(locale)
  }

  return (
    <ProfessionalDashboard
      user={user}
      onViewPendingAppointments={handleViewPendingAppointments}
      onViewUpcomingAppointments={handleViewUpcomingAppointments}
      onSetUnavailable={handleSetUnavailable}
      onViewTimetable={handleViewTimetable}
      onViewPreviousAppointments={handleViewPreviousAppointments}
      onLocaleChange={handleLocaleChange}
    />
  )
}
