import React from 'react'
import { useProfessionalTimetable } from '../hooks/useProfessionalTimetable'
import './Timetable.css'

interface TimetableProps {
  professionalID: string
  date: string
  onBack: () => void
  onDateChange: (newDate: string) => void
}

export default function Timetable({
  professionalID,
  date,
  onBack,
  onDateChange,
}: TimetableProps) {
  const { timetable, loading, error, refetch } = useProfessionalTimetable(professionalID, date)

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr)
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return timeStr
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr + 'T00:00:00')
      return date.toLocaleDateString('ru-RU', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    } catch {
      return dateStr
    }
  }

  const handlePrevDay = () => {
    const currentDate = new Date(date + 'T00:00:00')
    currentDate.setDate(currentDate.getDate() - 1)
    const newDate = currentDate.toISOString().split('T')[0]
    onDateChange(newDate)
  }

  const handleNextDay = () => {
    const currentDate = new Date(date + 'T00:00:00')
    currentDate.setDate(currentDate.getDate() + 1)
    const newDate = currentDate.toISOString().split('T')[0]
    onDateChange(newDate)
  }

  const today = new Date().toISOString().split('T')[0]
  const isToday = date === today

  if (loading) {
    return (
      <div className="container">
        <div className="loading-screen">
          <div className="loading">Загрузка расписания...</div>
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
        <h1>📅 My Timetable</h1>
        <p className="subtitle">{formatDate(date)}</p>
      </header>
      <div className="content">
        {!timetable || timetable.appointments.length === 0 ? (
          <div className="timetable-empty">
            <p>📋 No activities scheduled for this day.</p>
          </div>
        ) : (
          <div className="timetable-appointments">
            {timetable.appointments.map((apt, index) => (
              <div key={apt.id} className="timetable-slot">
                <div className="slot-header">
                  <span className="slot-number">📅 Slot #{index + 1}</span>
                </div>
                <div className="slot-details">
                  <p className="slot-time">
                    🕐 {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                  </p>
                  {apt.description && (
                    <p className="slot-description">📝 {apt.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="timetable-navigation">
          <button
            className="btn btn-secondary"
            onClick={handlePrevDay}
            disabled={loading}
          >
            ← Previous Day
          </button>
          {!isToday && (
            <button
              className="btn btn-secondary"
              onClick={() => onDateChange(today)}
              disabled={loading}
            >
              Today
            </button>
          )}
          <button
            className="btn btn-secondary"
            onClick={handleNextDay}
            disabled={loading}
          >
            Next Day →
          </button>
        </div>

        <div className="actions">
          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
