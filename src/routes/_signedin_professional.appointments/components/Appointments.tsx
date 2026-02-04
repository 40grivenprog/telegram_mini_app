import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProfessionalAppointments } from '../hooks/useProfessionalAppointments'
import { useConfirmAppointment } from '../hooks/useConfirmAppointment'
import { useCancelProfessionalAppointment } from '../../../hooks/professionals/useCancelProfessionalAppointment'
import { formatDate, formatTime } from '../../../utils/i18n'
import './Appointments.css'

interface AppointmentsProps {
  onBack: () => void
}

type Tab = 'pending' | 'confirmed'

export default function Appointments({ onBack }: AppointmentsProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<Tab>('pending')
  
  const pendingAppointments = useProfessionalAppointments('pending', 15, activeTab === 'pending')
  const confirmedAppointments = useProfessionalAppointments('confirmed', 15, activeTab === 'confirmed')
  const { confirmAppointment, confirming, error: confirmError } = useConfirmAppointment()
  const { cancelAppointment, canceling, error: cancelError } = useCancelProfessionalAppointment()
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [selectedAppointmentID, setSelectedAppointmentID] = useState<string | null>(null)
  const [cancellationReason, setCancellationReason] = useState('')

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    // Reset pagination when switching tabs
    if (tab === 'pending') {
      pendingAppointments.setPage(1)
    } else {
      confirmedAppointments.setPage(1)
    }
  }

  const handleConfirmClick = async (appointmentID: string) => {
    try {
      await confirmAppointment(appointmentID)
      if (activeTab === 'pending') {
        await pendingAppointments.refetch()
      } else {
        await confirmedAppointments.refetch()
      }
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
      // Refetch the active tab
      if (activeTab === 'pending') {
        await pendingAppointments.refetch()
      } else {
        await confirmedAppointments.refetch()
      }
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

  const renderClientInfo = (apt: any) => {
    if (apt.type === 'personal') {
      return apt.clients && apt.clients.length > 0 ? (
        <p className="client-name">
          <strong>👤 {t('common.client')}:</strong> {apt.clients[0]}
        </p>
      ) : null
    } else if (apt.type === 'split') {
      return apt.clients && apt.clients.length > 0 ? (
        <p className="client-name">
          <strong>👥 {t('common.clients')}:</strong> {apt.clients.join(', ')}
        </p>
      ) : null
    } else if (apt.type === 'group') {
      return apt.clients ? (
        <p className="client-name">
          <strong>👥 {t('common.clients')}:</strong> {apt.clients.length} {t('professional.appointments.clientsCount')}
        </p>
      ) : null
    }
    return null
  }

  const renderAppointmentType = (type: string) => {
    if (type === 'personal') {
      return t('professional.appointments.types.personal')
    } else if (type === 'split') {
      return t('professional.appointments.types.split')
    } else if (type === 'group') {
      return t('professional.appointments.types.group')
    }
    return type
  }

  const renderPendingAppointments = () => {
    if (pendingAppointments.loading) {
      return (
        <div className="loading-screen">
          <div className="loading">{t('professional.appointments.pendingTab.loading')}</div>
        </div>
      )
    }

    if (pendingAppointments.error) {
      return (
        <div className="error-screen">
          <div className="error-message">{pendingAppointments.error}</div>
          <button className="btn btn-primary" onClick={pendingAppointments.refetch}>
            {t('common.tryAgain')}
          </button>
        </div>
      )
    }

    if (pendingAppointments.appointments.length === 0) {
      return (
        <div className="no-appointments">
          <p>{t('professional.appointments.pendingTab.noAppointments')}</p>
        </div>
      )
    }

    return (
      <>
        <div className="appointments-list">
          {pendingAppointments.appointments.map((apt) => (
            <div key={apt.id} className="appointment-card">
              <div className="appointment-details">
                <p className="appointment-type">
                  <strong>🏋️ {t('professional.appointments.type')}:</strong> {renderAppointmentType(apt.type)}
                </p>
                {renderClientInfo(apt)}
                <p className="appointment-date">
                  <strong>📅 {t('common.date')}:</strong> {formatDate(apt.start_time, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="appointment-time">
                  <strong>🕐 {t('common.time')}:</strong> {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                </p>
                <div className="appointment-actions">
                  <button
                    className="btn btn-primary btn-small"
                    onClick={() => handleConfirmClick(apt.id)}
                    disabled={confirming || canceling}
                  >
                    ✅ {t('common.confirm')}
                  </button>
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
        {pendingAppointments.pagination && (pendingAppointments.pagination.has_next_page || pendingAppointments.pagination.page > 1 || pendingAppointments.appointments.length >= pendingAppointments.pagination.page_size) && (
          <div className="pagination">
            <button
              className="btn btn-secondary"
              disabled={pendingAppointments.page === 1}
              onClick={() => pendingAppointments.setPage(pendingAppointments.page - 1)}
            >
              {t('common.previous')}
            </button>
            <span className="page-info">
              {t('common.page')} {pendingAppointments.pagination.page}
            </span>
            <button
              className="btn btn-secondary"
              disabled={!pendingAppointments.pagination.has_next_page}
              onClick={() => pendingAppointments.setPage(pendingAppointments.page + 1)}
            >
              {t('common.next')}
            </button>
          </div>
        )}
      </>
    )
  }

  const renderConfirmedAppointments = () => {
    if (confirmedAppointments.loading) {
      return (
        <div className="loading-screen">
          <div className="loading">{t('professional.appointments.confirmedTab.loading')}</div>
        </div>
      )
    }

    if (confirmedAppointments.error) {
      return (
        <div className="error-screen">
          <div className="error-message">{confirmedAppointments.error}</div>
          <button className="btn btn-primary" onClick={confirmedAppointments.refetch}>
            {t('common.tryAgain')}
          </button>
        </div>
      )
    }

    if (confirmedAppointments.appointments.length === 0) {
      return (
        <div className="no-appointments">
          <p>{t('professional.appointments.confirmedTab.noAppointments')}</p>
        </div>
      )
    }

    return (
      <>
        <div className="appointments-list">
          {confirmedAppointments.appointments.map((apt) => (
            <div key={apt.id} className="appointment-card">
              <div className="appointment-details">
                <p className="appointment-type">
                  <strong>🏋️ {t('professional.appointments.type')}:</strong> {renderAppointmentType(apt.type)}
                </p>
                {renderClientInfo(apt)}
                <p className="appointment-date">
                  <strong>📅 {t('common.date')}:</strong> {formatDate(apt.start_time, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="appointment-time">
                  <strong>🕐 {t('common.time')}:</strong> {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                </p>
                <div className="appointment-actions">
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
        {confirmedAppointments.pagination && (confirmedAppointments.pagination.has_next_page || confirmedAppointments.pagination.page > 1 || confirmedAppointments.appointments.length >= confirmedAppointments.pagination.page_size) && (
          <div className="pagination">
            <button
              className="btn btn-secondary"
              disabled={confirmedAppointments.page === 1}
              onClick={() => confirmedAppointments.setPage(confirmedAppointments.page - 1)}
            >
              {t('common.previous')}
            </button>
            <span className="page-info">
              {t('common.page')} {confirmedAppointments.pagination.page}
            </span>
            <button
              className="btn btn-secondary"
              disabled={!confirmedAppointments.pagination.has_next_page}
              onClick={() => confirmedAppointments.setPage(confirmedAppointments.page + 1)}
            >
              {t('common.next')}
            </button>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="container">
      <header className="header">
        <h1>📋 {t('professional.appointments.title')}</h1>
      </header>
      <div className="content">
        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => handleTabChange('pending')}
          >
            ⏳ {t('professional.appointments.pending')}
          </button>
          <button
            className={`tab ${activeTab === 'confirmed' ? 'active' : ''}`}
            onClick={() => handleTabChange('confirmed')}
          >
            ✅ {t('professional.appointments.confirmed')}
          </button>
        </div>

        {confirmError && <div className="error-message">{confirmError}</div>}
        {cancelError && <div className="error-message">{cancelError}</div>}

        {/* Tab Content */}
        {activeTab === 'pending' ? renderPendingAppointments() : renderConfirmedAppointments()}

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
