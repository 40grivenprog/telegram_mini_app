import React from 'react'
import { useProfessionalAppointments } from '../hooks/useProfessionalAppointments'
import './ProfessionalPendingAppointments.css'

interface ProfessionalPendingAppointmentsProps {
  onBack: () => void
}

export default function ProfessionalPendingAppointments({
  onBack
}: ProfessionalPendingAppointmentsProps) {
  const { appointments, loading, error, refetch } = useProfessionalAppointments('pending')

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr)
      if (isNaN(date.getTime())) {
        return timeStr
      }
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return timeStr
    }
  }

  const formatDate = (timeStr: string) => {
    try {
      const date = new Date(timeStr)
      if (isNaN(date.getTime())) {
        return timeStr
      }
      return date.toLocaleDateString('ru-RU', { 
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return timeStr
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading-screen">
          <div className="loading">Загрузка...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <header className="header">
        <h1>⏳ Pending Appointments</h1>
      </header>
      <div className="content">
        {error && <div className="error-message">{error}</div>}
        
        {appointments.length === 0 ? (
          <div className="empty-state">
            <p>No pending appointments</p>
          </div>
        ) : (
          <div className="appointments-list">
            {appointments.map((apt, index) => (
              <div key={apt.id} className="appointment-card">
                <div className="appointment-number">#{index + 1}</div>
                <div className="appointment-details">
                  {apt.client && (
                    <p className="client-name">
                      <strong>👤 Client:</strong> {apt.client.first_name} {apt.client.last_name}
                    </p>
                  )}
                  <p className="appointment-date">
                    <strong>📅 Date:</strong> {formatDate(apt.start_time)}
                  </p>
                  <p className="appointment-time">
                    <strong>🕐 Time:</strong> {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                  </p>
                  {apt.description && (
                    <p className="appointment-description">
                      <strong>📝 Description:</strong> {apt.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="actions">
          <button
            className="btn btn-secondary"
            onClick={onBack}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
