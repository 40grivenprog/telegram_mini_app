import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, Calendar as CalendarIcon, User, FileText, Tag, Clock, CheckCircle } from 'lucide-react'
import { useClientAppointments } from '../hooks/useClientAppointments'
import { useCancelAppointment } from '../hooks/useCancelAppointment'
import { formatDate, formatTime } from '../../../utils/i18n'
import './Appointments.css'

interface AppointmentsProps {
  onBack: () => void
}

type Tab = 'pending' | 'confirmed'

export default function Appointments({ onBack }: AppointmentsProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<Tab>('pending')
  
  // Load appointments conditionally based on active tab
  const pendingAppointments = useClientAppointments('pending', 15, activeTab === 'pending')
  const confirmedAppointments = useClientAppointments('confirmed', 15, activeTab === 'confirmed')
  const { cancelAppointment, canceling, error: cancelError } = useCancelAppointment()

  // Modal state
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

  const renderAppointmentType = (type?: string) => {
    if (!type) return null
    if (type === 'personal') {
      return t('professional.appointments.types.personal')
    } else if (type === 'split') {
      return t('professional.appointments.types.split')
    } else if (type === 'group') {
      return t('professional.appointments.types.group')
    }
    return type
  }

  const handleCancelClick = (appointmentID: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedAppointmentID(appointmentID)
    setCancellationReason(t('common.clientDefaultCancelReason'))
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

  const renderPendingAppointments = () => {
    if (pendingAppointments.loading) {
      return (
        <div className="appointments-status">
          <Loader2 size={32} className="spinner" />
          <p>{t('client.appointments.pendingTab.loading')}</p>
        </div>
      )
    }

    if (pendingAppointments.error) {
      return (
        <div className="appointments-status appointments-error">
          <AlertCircle size={32} />
          <p>{pendingAppointments.error}</p>
          <button className="btn btn-secondary" onClick={pendingAppointments.refetch}>
            {t('common.tryAgain')}
          </button>
        </div>
      )
    }

    if (pendingAppointments.appointments.length === 0) {
      return (
        <div className="appointments-status">
          <Clock size={40} className="empty-icon" />
          <p>{t('client.appointments.pendingTab.noAppointments')}</p>
        </div>
      )
    }

    return (
      <>
        <div className="appointments-list">
          {pendingAppointments.appointments.map((apt) => (
            <div key={apt.id} className="appointment-card">
              <div className="appointment-details">
                {apt.professional && (
                  <p className="coach-name">
                    <strong><User size={16} /> {t('common.coach')}:</strong> {apt.professional.first_name} {apt.professional.last_name}
                  </p>
                )}
                {apt.type && (
                  <p className="appointment-type">
                    <strong><Tag size={16} /> {t('professional.appointments.type')}:</strong> {renderAppointmentType(apt.type)}
                  </p>
                )}
                <p className="appointment-date">
                  <strong><CalendarIcon size={16} /> {t('common.date')}:</strong> {formatDate(apt.start_time, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="appointment-time">
                  <strong><Clock size={16} /> {t('common.time')}:</strong> {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                </p>
                {apt.description && (
                  <p className="appointment-description">
                    <strong><FileText size={16} /> {t('common.description')}:</strong> {apt.description}
                  </p>
                )}
              </div>
              <div className="appointment-actions">
                <button
                  className="btn btn-danger btn-small"
                  onClick={(e) => handleCancelClick(apt.id, e)}
                  disabled={canceling}
                >
                  {t('client.appointments.cancel')}
                </button>
              </div>
            </div>
          ))}
        </div>
        {pendingAppointments.pagination && (pendingAppointments.pagination.has_next_page || pendingAppointments.pagination.page > 1 || pendingAppointments.appointments.length >= pendingAppointments.pagination.page_size) && (
          <div className="appointments-pagination">
            <button
              className="btn btn-pagination"
              disabled={pendingAppointments.page === 1}
              onClick={() => pendingAppointments.setPage(pendingAppointments.page - 1)}
            >
              <ChevronLeft size={18} />
              {t('common.previous')}
            </button>
            <span className="page-indicator">
              {t('common.page')} {pendingAppointments.pagination.page}
            </span>
            <button
              className="btn btn-pagination"
              disabled={!pendingAppointments.pagination.has_next_page}
              onClick={() => pendingAppointments.setPage(pendingAppointments.page + 1)}
            >
              {t('common.next')}
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </>
    )
  }

  const renderConfirmedAppointments = () => {
    if (confirmedAppointments.loading) {
      return (
        <div className="appointments-status">
          <Loader2 size={32} className="spinner" />
          <p>{t('client.appointments.confirmedTab.loading')}</p>
        </div>
      )
    }

    if (confirmedAppointments.error) {
      return (
        <div className="appointments-status appointments-error">
          <AlertCircle size={32} />
          <p>{confirmedAppointments.error}</p>
          <button className="btn btn-secondary" onClick={confirmedAppointments.refetch}>
            {t('common.tryAgain')}
          </button>
        </div>
      )
    }

    if (confirmedAppointments.appointments.length === 0) {
      return (
        <div className="appointments-status">
          <CheckCircle size={40} className="empty-icon" />
          <p>{t('client.appointments.confirmedTab.noAppointments')}</p>
        </div>
      )
    }

    return (
      <>
        <div className="appointments-list">
          {confirmedAppointments.appointments.map((apt) => (
            <div key={apt.id} className="appointment-card">
              <div className="appointment-details">
                {apt.professional && (
                  <p className="coach-name">
                    <strong><User size={16} /> {t('common.coach')}:</strong> {apt.professional.first_name} {apt.professional.last_name}
                  </p>
                )}
                {apt.type && (
                  <p className="appointment-type">
                    <strong><Tag size={16} /> {t('professional.appointments.type')}:</strong> {renderAppointmentType(apt.type)}
                  </p>
                )}
                <p className="appointment-date">
                  <strong><CalendarIcon size={16} /> {t('common.date')}:</strong> {formatDate(apt.start_time, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="appointment-time">
                  <strong><Clock size={16} /> {t('common.time')}:</strong> {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                </p>
                {apt.description && (
                  <p className="appointment-description">
                    <strong><FileText size={16} /> {t('common.description')}:</strong> {apt.description}
                  </p>
                )}
              </div>
              <div className="appointment-actions">
                <button
                  className="btn btn-danger btn-small"
                  onClick={(e) => handleCancelClick(apt.id, e)}
                  disabled={canceling}
                >
                  {t('client.appointments.cancel')}
                </button>
              </div>
            </div>
          ))}
        </div>
        {confirmedAppointments.pagination && (confirmedAppointments.pagination.has_next_page || confirmedAppointments.pagination.page > 1 || confirmedAppointments.appointments.length >= confirmedAppointments.pagination.page_size) && (
          <div className="appointments-pagination">
            <button
              className="btn btn-pagination"
              disabled={confirmedAppointments.page === 1}
              onClick={() => confirmedAppointments.setPage(confirmedAppointments.page - 1)}
            >
              <ChevronLeft size={18} />
              {t('common.previous')}
            </button>
            <span className="page-indicator">
              {t('common.page')} {confirmedAppointments.pagination.page}
            </span>
            <button
              className="btn btn-pagination"
              disabled={!confirmedAppointments.pagination.has_next_page}
              onClick={() => confirmedAppointments.setPage(confirmedAppointments.page + 1)}
            >
              {t('common.next')}
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="appointments-container">
      <div className="appointments-wrapper">
        <header className="appointments-header">
          <h1>{t('client.appointments.title')}</h1>
        </header>

        <div className="appointments-tabs">
          <button
            className={`appointments-tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => handleTabChange('pending')}
          >
            <Clock size={18} />
            {t('client.appointments.pending')}
          </button>
          <button
            className={`appointments-tab ${activeTab === 'confirmed' ? 'active' : ''}`}
            onClick={() => handleTabChange('confirmed')}
          >
            <CheckCircle size={18} />
            {t('client.appointments.confirmed')}
          </button>
        </div>

        {cancelError && <div className="error-message">{cancelError}</div>}

        <div className="appointments-content">
          {activeTab === 'pending' ? renderPendingAppointments() : renderConfirmedAppointments()}
        </div>

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
                  className="btn btn-danger"
                  onClick={handleCancelConfirm}
                  disabled={canceling || !cancellationReason.trim()}
                >
                  {canceling ? t('common.canceling') : t('common.confirmCancel')}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleCancelClose}
                  disabled={canceling}
                >
                  {t('common.back')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
