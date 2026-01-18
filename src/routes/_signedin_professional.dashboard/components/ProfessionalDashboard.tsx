import React from 'react'
import './ProfessionalDashboard.css'

interface ProfessionalDashboardProps {
  user: any
  onViewPendingAppointments: () => void
  onViewUpcomingAppointments: () => void
  onSetUnavailable: () => void
  onViewTimetable: () => void
  onViewPreviousAppointments: () => void
}

export default function ProfessionalDashboard({
  user,
  onViewPendingAppointments,
  onViewUpcomingAppointments,
  onSetUnavailable,
  onViewTimetable,
  onViewPreviousAppointments
}: ProfessionalDashboardProps) {
  return (
    <div className="container">
      <header className="header">
        <h1>👋 Welcome back, {user?.first_name}!</h1>
      </header>
      <div className="content">
        <div className="dashboard-actions">
          <button
            className="btn btn-secondary btn-large"
            onClick={onViewPendingAppointments}
          >
            ⏳ Pending Appointments
          </button>
          <button
            className="btn btn-secondary btn-large"
            onClick={onViewUpcomingAppointments}
          >
            📋 Upcoming Appointments
          </button>
          <button
            className="btn btn-secondary btn-large"
            onClick={onSetUnavailable}
          >
            🚫 Set Unavailable
          </button>
          <button
            className="btn btn-secondary btn-large"
            onClick={onViewTimetable}
          >
            📅 My Timetable
          </button>
          <button
            className="btn btn-secondary btn-large"
            onClick={onViewPreviousAppointments}
          >
            📜 Previous Appointments
          </button>
        </div>
      </div>
    </div>
  )
}
