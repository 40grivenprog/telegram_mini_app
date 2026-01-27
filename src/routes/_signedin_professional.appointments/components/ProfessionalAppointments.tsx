import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProfessionalAppointments } from '../hooks/useProfessionalAppointments'
import { useConfirmAppointment } from '../hooks/useConfirmAppointment'
import { useCancelProfessionalAppointment } from '../../../hooks/professionals/useCancelProfessionalAppointment'
import { formatDate, formatTime } from '../../../utils/i18n'
import './ProfessionalAppointments.css'

interface ProfessionalPendingAppointmentsProps {
  status: 'pending' | 'upcoming' | ''
  onBack: () => void
}

export default function ProfessionalPendingAppointments({
  status,
  onBack
}: ProfessionalPendingAppointmentsProps) {
  const { t } = useTranslation()
  const { appointments, loading, error, refetch, pagination, page, setPage } = useProfessionalAppointments(status === 'pending' ? 'pending' : 'confirmed')
  const { confirmAppointment, confirming, error: confirmError } = useConfirmAppointment()
  const { cancelAppointment, canceling, error: cancelError } = useCancelProfessionalAppointment()
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [selectedAppointmentID, setSelectedAppointmentID] = useState<string | null>(null)
  const [cancellationReason, setCancellationReason] = useState('')

  const getTitle = () => {
    if (status === 'pending') return `⏳ ${t('professional.appointments.pending')}`
    if (status === 'upcoming') return `📅 ${t('professional.appointments.upcoming')}`
    return `📋 ${t('professional.appointments.title')}`
  }

  const handleConfirmClick = async (appointmentID: string) => {
    try {
      await confirmAppointment(appointmentID)
      await refetch()
      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.showAlert(t('common.appointmentConfirmed'))
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
        tg.showAlert(t('common.cancelReasonRequired'))
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
        tg.showAlert(t('common.appointmentCancelled'))
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
          <div className="loading">{t('common.loading')}</div>
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
            <p>{t('common.noAppointments')}</p>
          </div>
        ) : (
          <div className="appointments-list">
            {appointments.map((apt, index) => (
              <div key={apt.id} className="appointment-card">
                <div className="appointment-details">
                  {apt.client && (
                    <p className="client-name">
                      <strong>👤 {t('common.client')}:</strong> {apt.client.first_name} {apt.client.last_name}
                    </p>
                  )}
                  <p className="appointment-date">
                    <strong>📅 {t('common.date')}:</strong> {formatDate(apt.start_time, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="appointment-time">
                    <strong>🕐 {t('common.time')}:</strong> {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                  </p>
                  {apt.description && (
                    <p className="appointment-description">
                      <strong>📝 {t('common.description')}:</strong> {apt.description}
                    </p>
                  )}
                  <div className="appointment-actions">
                    {status === 'pending' && (
                      <button
                        className="btn btn-primary btn-small"
                        onClick={() => handleConfirmClick(apt.id)}
                        disabled={confirming || canceling}
                      >
                        ✅ {t('common.confirm')}
                      </button>
                    )}
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleCancelClick(apt.id)}
                      disabled={canceling}
                    >
                      ❌ {t('common.cancel')}
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
              <h2>{t('common.cancelAppointment')}</h2>
              <p className="modal-subtitle">{t('common.cancelReasonPrompt')}</p>
              <textarea
                className="modal-textarea"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder={t('common.cancelReasonPlaceholder')}
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
                  {t('common.back')}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleCancelConfirm}
                  disabled={canceling || !cancellationReason.trim()}
                >
                  {canceling ? t('common.canceling') : t('common.confirmCancel')}
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
                {t('common.previous')}
              </button>
              <span className="pagination-info">
                {t('common.page')} {pagination.page}
              </span>
              <button
                className="btn btn-secondary btn-small"
                onClick={() => setPage(page + 1)}
                disabled={loading || !pagination.has_next_page}
              >
                {t('common.next')}
              </button>
            </div>
          </div>
        )}

        <div className="actions">
          <button
            className="btn btn-secondary"
            onClick={onBack}
          >
            {t('common.backToDashboard')}
          </button>
        </div>
      </div>
    </div>
  )
}
