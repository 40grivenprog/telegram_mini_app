import React from 'react'
import './ProfessionalDashboard.css'

interface ProfessionalDashboardProps {
  user: any
  onViewPendingAppointments: () => void
}

export default function ProfessionalDashboard({
  user,
  onViewPendingAppointments
}: ProfessionalDashboardProps) {
  return (
    <div className="container">
      <header className="header">
        <h1>👋 Welcome back, {user?.first_name}!</h1>
        <p className="subtitle">You are registered as a {user?.role}.</p>
      </header>
      <div className="content">
        <div className="dashboard-actions">
          <button
            className="btn btn-primary btn-large"
            onClick={onViewPendingAppointments}
          >
            ⏳ Pending Appointments
          </button>
        </div>
      </div>
    </div>
  )
}
