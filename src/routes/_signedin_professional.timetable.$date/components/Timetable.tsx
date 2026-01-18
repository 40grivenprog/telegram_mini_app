import React, { useState } from 'react'
import { useProfessionalTimetable } from '../hooks/useProfessionalTimetable'
import { useCancelProfessionalAppointment } from '../../../hooks/professionals/useCancelProfessionalAppointment'
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
  const { cancelAppointment, canceling, error: cancelError } = useCancelProfessionalAppointment()
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [selectedAppointmentID, setSelectedAppointmentID] = useState<string | null>(null)
  const [cancellationReason, setCancellationReason] = useState('')

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
    const [year, monthNum, dayNum] = date.split('-').map(Number)
    const currentDate = new Date(year, monthNum - 1, dayNum)
    currentDate.setDate(currentDate.getDate() - 1)
    const newDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
    onDateChange(newDate)
  }

  const handleNextDay = () => {
    const [year, monthNum, dayNum] = date.split('-').map(Number)
    const currentDate = new Date(year, monthNum - 1, dayNum)
    currentDate.setDate(currentDate.getDate() + 1)
    const newDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
    onDateChange(newDate)
  }

  const today = new Date().toISOString().split('T')[0]
  const isToday = date === today

  const handleCancelClick = (appointmentID: string) => {
    setSelectedAppointmentID(appointmentID)
    setCancellationReason('')
    setCancelModalOpen(true)
  }

  const handleCancelConfirm = async () => {
    if (!selectedAppointmentID || !cancellationReason.trim()) {
      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.showAlert('Пожалуйста, укажите причину отмены')
      }
      return
    }

    try {
      await cancelAppointment(selectedAppointmentID, cancellationReason.trim())
      setCancelModalOpen(false)
      setSelectedAppointmentID(null)
      setCancellationReason('')
      await refetch()
      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.showAlert('Бронирование успешно отменено')
      }
    } catch {
      // Error is already handled by the hook
    }
  }

  const handleCancelClose = () => {
    setCancelModalOpen(false)
    setSelectedAppointmentID(null)
    setCancellationReason('')
  }

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
        {error && <div className="error-message">{error}</div>}
        {cancelError && <div className="error-message">{cancelError}</div>}
        
        {!timetable || timetable.appointments.length === 0 ? (
          <div className="timetable-empty">
            <p>📋 No activities scheduled for this day({formatDate(date)}).</p>
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
                <div className="slot-actions">
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => handleCancelClick(apt.id)}
                    disabled={canceling}
                  >
                    ❌ Cancel Slot #{index + 1}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="timetable-navigation">
          {!isToday && (
            <button
              className="btn btn-secondary"
              onClick={handlePrevDay}
              disabled={loading || canceling}
            >
              ⬅️ Previous Day
            </button>
          )}
          <button
            className="btn btn-secondary"
            onClick={handleNextDay}
            disabled={loading || canceling}
          >
            Next Day ➡️
          </button>
        </div>

        <div className="actions">
          <button className="btn btn-secondary" onClick={onBack} disabled={canceling}>
            ← Back to Dashboard
          </button>
        </div>

        {cancelModalOpen && (
          <div className="modal-overlay" onClick={handleCancelClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Cancel Appointment</h2>
              <p className="modal-subtitle">Please provide a reason for cancellation:</p>
              <textarea
                className="modal-textarea"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Enter cancellation reason..."
                rows={4}
                disabled={canceling}
              />
              {cancelError && <div className="error-message">{cancelError}</div>}
              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={handleCancelClose}
                  disabled={canceling}
                >
                  Back
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleCancelConfirm}
                  disabled={canceling || !cancellationReason.trim()}
                >
                  {canceling ? 'Canceling...' : 'Confirm Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
