import React from 'react'
import { usePreviousAppointmentsByClient } from '../hooks/usePreviousAppointmentsByClient'
import './PreviousAppointments.css'

interface PreviousAppointmentsProps {
  professionalID: string
  clientID: string
  clientName: string
  month: string // Format: YYYY-MM
  onBack: () => void
  onMonthChange: (newMonth: string) => void
}

export default function PreviousAppointments({
  professionalID,
  clientID,
  clientName,
  month,
  onBack,
  onMonthChange,
}: PreviousAppointmentsProps) {
  const { appointments, loading, error, refetch } = usePreviousAppointmentsByClient(professionalID, clientID, month)

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr)
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return timeStr
    }
  }

  const formatDate = (timeStr: string) => {
    try {
      const date = new Date(timeStr)
      return date.toLocaleDateString('ru-RU', { 
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return timeStr
    }
  }

  const formatMonth = (monthStr: string) => {
    try {
      const [year, month] = monthStr.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1, 1)
      return date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' })
    } catch {
      return monthStr
    }
  }

  const handlePrevMonth = () => {
    const [year, monthNum] = month.split('-').map(Number)
    const currentDate = new Date(year, monthNum - 1, 1)
    currentDate.setMonth(currentDate.getMonth() - 1)
    const newMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    onMonthChange(newMonth)
  }

  const handleNextMonth = () => {
    const [year, monthNum] = month.split('-').map(Number)
    const currentDate = new Date(year, monthNum - 1, 1)
    currentDate.setMonth(currentDate.getMonth() + 1)
    const newMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    onMonthChange(newMonth)
  }

  const handleCurrentMonth = () => {
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
    onMonthChange(currentMonth)
  }

  const currentMonth = new Date().toISOString().slice(0, 7)
  const isCurrentMonth = month === currentMonth

  if (loading) {
    return (
      <div className="container">
        <div className="loading-screen">
          <div className="loading">Загрузка предыдущих бронирований...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-screen">
          <div className="error-message">{error}</div>
          <button className="btn btn-primary" onClick={refetch}>
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <header className="header">
        <h1>📜 Previous Appointments</h1>
        <p className="subtitle">
          {clientName && `Client: ${clientName}`}
          <br />
          {formatMonth(month)}
        </p>
      </header>
      <div className="content">
        {appointments.length === 0 ? (
          <div className="empty-state">
            <p>No appointments found for this month.</p>
          </div>
        ) : (
          <div className="appointments-list">
            {appointments.map((apt) => (
              <div key={apt.id} className="appointment-card">
                <div className="appointment-details">
                  <p className="appointment-date">📅 {formatDate(apt.start_time)}</p>
                  <p className="appointment-time">
                    🕐 {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                  </p>
                  {apt.description && (
                    <p className="appointment-description">📝 {apt.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="month-navigation">
          <button
            className="btn btn-secondary"
            onClick={handlePrevMonth}
            disabled={loading}
          >
            ← Previous Month
          </button>
          {!isCurrentMonth && (
            <button
              className="btn btn-secondary"
              onClick={handleCurrentMonth}
              disabled={loading}
            >
              Current Month
            </button>
          )}
          <button
            className="btn btn-secondary"
            onClick={handleNextMonth}
            disabled={loading}
          >
            Next Month →
          </button>
        </div>

        <div className="actions">
          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Client Selection
          </button>
        </div>
      </div>
    </div>
  )
}
