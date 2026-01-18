import React, { useState } from 'react'
import { useProfessionalAppointments } from '../hooks/useProfessionalAppointments'
import { useConfirmAppointment } from '../hooks/useConfirmAppointment'
import { useCancelProfessionalAppointment } from '../../../hooks/professionals/useCancelProfessionalAppointment'
import './ProfessionalAppointments.css'

interface ProfessionalPendingAppointmentsProps {
  status: 'pending' | 'upcoming' | ''
  onBack: () => void
}

export default function ProfessionalPendingAppointments({
  status,
  onBack
}: ProfessionalPendingAppointmentsProps) {
  const { appointments, loading, error, refetch, pagination, page, setPage } = useProfessionalAppointments(status === 'pending' ? 'pending' : 'confirmed')
  const { confirmAppointment, confirming, error: confirmError } = useConfirmAppointment()
  const { cancelAppointment, canceling, error: cancelError } = useCancelProfessionalAppointment()
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [selectedAppointmentID, setSelectedAppointmentID] = useState<string | null>(null)
  const [cancellationReason, setCancellationReason] = useState('')

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

  const getTitle = () => {
    if (status === 'pending') return '⏳ Pending Appointments'
    if (status === 'upcoming') return '📅 Upcoming Appointments'
    return '📋 My Appointments'
  }

  const handleConfirmClick = async (appointmentID: string) => {
    try {
      await confirmAppointment(appointmentID)
      await refetch()
      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.showAlert('Бронирование успешно подтверждено')
      }
    } catch {
      // Error is already handled by the hook
    }
  }

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
          <div className="loading">Загрузка...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <header className="header">
        <h1>{getTitle()}</h1>
      </header>
      <div className="content">
        {error && <div className="error-message">{error}</div>}
        {confirmError && <div className="error-message">{confirmError}</div>}
        {cancelError && <div className="error-message">{cancelError}</div>}
        
        {appointments.length === 0 ? (
          <div className="empty-state">
            <p>No appointments found</p>
          </div>
        ) : (
          <div className="appointments-list">
            {appointments.map((apt, index) => (
              <div key={apt.id} className="appointment-card">
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
                  <div className="appointment-actions">
                    {status === 'pending' && (
                      <button
                        className="btn btn-primary btn-small"
                        onClick={() => handleConfirmClick(apt.id)}
                        disabled={confirming || canceling}
                      >
                        ✅ Confirm
                      </button>
                    )}
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleCancelClick(apt.id)}
                      disabled={canceling}
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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

        {pagination && (pagination.has_next_page || pagination.page > 1 || appointments.length >= pagination.page_size) && (
          <div className="pagination">
            <div className="pagination-controls">
              <button
                className="btn btn-secondary btn-small"
                onClick={() => setPage(page - 1)}
                disabled={loading || page <= 1}
              >
                ← Previous
              </button>
              <span className="pagination-info">
                Page {pagination.page}
              </span>
              <button
                className="btn btn-secondary btn-small"
                onClick={() => setPage(page + 1)}
                disabled={loading || !pagination.has_next_page}
              >
                Next →
              </button>
            </div>
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
