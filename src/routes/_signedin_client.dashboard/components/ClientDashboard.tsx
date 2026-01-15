import React from 'react'
import './ClientDashboard.css'

interface ClientDashboardProps {
  user: any
  onBookAppointment: () => void
}

export default function ClientDashboard({ user, onBookAppointment }: ClientDashboardProps) {
  return (
    <div className="container">
      <header className="header">
        <h1>👋 Welcome back, {user?.first_name}!</h1>
        <p className="subtitle">You are registered as a {user?.role}.</p>
        <p className="subtitle">What would you like to do?</p>
      </header>
      <div className="content">
        <div className="dashboard-actions">
          <button
            className="btn btn-primary btn-large"
            onClick={onBookAppointment}
          >
            📅 Book Appointment
          </button>
        </div>
      </div>
    </div>
  )
}
