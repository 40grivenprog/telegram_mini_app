import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePreviousAppointments } from '../hooks/usePreviousAppointments'
import { useCancelProfessionalAppointment } from '../../../hooks/professionals/useCancelProfessionalAppointment'
import { useAppointmentDetails, AppointmentDetails } from '../hooks/useAppointmentDetails'
import { formatDate, formatTime } from '../../../utils/i18n'
import './PreviousAppointments.css'

interface PreviousAppointmentsProps {
  clientID: string | null
  clientName: string
  onBack: () => void
}

export default function PreviousAppointments({
  clientID,
  clientName,
  onBack,
}: PreviousAppointmentsProps) {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const { appointments, pagination, loading, error, refetch, loadPage } = usePreviousAppointments(clientID, page, 15)
  const { cancelAppointment, canceling, error: cancelError } = useCancelProfessionalAppointment()
  const { getAppointmentDetails, loading: detailsLoading } = useAppointmentDetails()
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedAppointmentID, setSelectedAppointmentID] = useState<string | null>(null)
  const [appointmentDetails, setAppointmentDetails] = useState<AppointmentDetails | null>(null)
  const [cancellationReason, setCancellationReason] = useState('')

  const handleCancelClick = (appointmentID: string) => {
    setSelectedAppointmentID(appointmentID)
    setCancellationReason(t('common.defaultCancelReason'))
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

  const handleViewDetailsClick = async (appointmentID: string) => {
    setSelectedAppointmentID(appointmentID)
    setDetailsModalOpen(true)
    const details = await getAppointmentDetails(appointmentID)
    if (details) {
      setAppointmentDetails(details)
    }
  }

  const handleDetailsClose = () => {
    setDetailsModalOpen(false)
    setSelectedAppointmentID(null)
    setAppointmentDetails(null)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    loadPage(newPage)
  }

  if (loading && appointments.length === 0) {
    return (
      <div className="container">
        <div className="loading-screen">
          <div className="loading">{t('common.loading')}</div>
        </div>
      </div>
    )
  }

  if (error && appointments.length === 0) {
    return (
      <div className="container">
        <div className="error-screen">
          <div className="error-message">{error}</div>
          <button className="btn btn-primary" onClick={refetch}>
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <header className="header">
        <h1>📜 {t('professional.previousAppointments.byClient.title')}</h1>
        <p className="subtitle">
          {clientName && t('professional.previousAppointments.byClient.clientLabel', { name: clientName })}
        </p>
      </header>
      <div className="content">
        {appointments.length === 0 ? (
          <div className="empty-state">
            <p>{t('professional.previousAppointments.byClient.noAppointments')}</p>
          </div>
        ) : (
          <>
            <div className="appointments-list">
              {appointments.map((apt) => (
                <div key={apt.id} className="appointment-card">
                  <div className="appointment-details">
                    <p className="appointment-date">📅 {formatDate(apt.start_time, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="appointment-time">
                      🕐 {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                    </p>
                    {apt.type && (
                      <p className="appointment-type">
                        {t('professional.appointments.type')}: {t(`professional.appointments.types.${apt.type}`)}
                      </p>
                    )}
                    {apt.users_count > 0 && (
                      <p className="appointment-clients">
                        👥 {apt.users_count} {t('professional.appointments.clientsCount')}
                      </p>
                    )}
                    {apt.description && apt.description.trim() && (
                      <p className="appointment-description">📝 {apt.description}</p>
                    )}
                  </div>
                  <div className="appointment-actions">
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => handleViewDetailsClick(apt.id)}
                      disabled={detailsLoading}
                    >
                      {t('common.viewDetails')}
                    </button>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleCancelClick(apt.id)}
                      disabled={canceling}
                    >
                      {t('common.cancelAppointment')}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {pagination && (pagination.has_next_page || pagination.page > 1 || appointments.length >= pagination.page_size) && (
              <div className="pagination">
                <div className="pagination-controls">
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={loading || page <= 1}
                  >
                    {t('common.previous')}
                  </button>
                  <span className="pagination-info">
                    {t('common.page')} {pagination.page}
                  </span>
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={loading || !pagination.has_next_page}
                  >
                    {t('common.next')}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <div className="actions">
          <button className="btn btn-secondary" onClick={onBack}>
            {t('common.backToClientSelection')}
          </button>
        </div>
      </div>

      {/* Details Modal */}
      {detailsModalOpen && (
        <div className="modal-overlay" onClick={handleDetailsClose}>
          <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
            <h2>{t('common.appointmentDetails')}</h2>
            {detailsLoading ? (
              <div className="loading">{t('common.loading')}</div>
            ) : appointmentDetails ? (
              <div className="appointment-details-content">
                <div className="detail-row">
                  <span className="detail-label">{t('common.date')}:</span>
                  <span className="detail-value">
                    {formatDate(appointmentDetails.start_time, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">{t('common.time')}:</span>
                  <span className="detail-value">
                    {formatTime(appointmentDetails.start_time)} - {formatTime(appointmentDetails.end_time)}
                  </span>
                </div>
                {appointmentDetails.type && (
                  <div className="detail-row">
                    <span className="detail-label">{t('professional.appointments.type')}:</span>
                    <span className="detail-value">
                      {t(`professional.appointments.types.${appointmentDetails.type}`)}
                    </span>
                  </div>
                )}
                {appointmentDetails.description && appointmentDetails.description.trim() && (
                  <div className="detail-row">
                    <span className="detail-label">{t('common.description')}:</span>
                    <span className="detail-value">{appointmentDetails.description}</span>
                  </div>
                )}
                {appointmentDetails.clients && appointmentDetails.clients.length > 0 && (
                  <div className="detail-section">
                    <h3 className="detail-section-title">
                      {t('common.clients')} ({appointmentDetails.clients.length})
                    </h3>
                    <div className="clients-list">
                      {appointmentDetails.clients.map((client) => (
                        <div key={client.id} className="client-item">
                          {client.first_name} {client.last_name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="error-message">{t('error.loadAppointmentsFailed')}</div>
            )}
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={handleDetailsClose}>
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
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
    </div>
  )
}
