import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProfessionalTimetable } from '../hooks/useProfessionalTimetable'
import { useCancelProfessionalAppointment } from '../../../hooks/professionals/useCancelProfessionalAppointment'
import { formatDate, formatTime } from '../../../utils/i18n'
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
  const { t } = useTranslation()
  const { timetable, loading, error, refetch } = useProfessionalTimetable(professionalID, date)
  const { cancelAppointment, canceling, error: cancelError } = useCancelProfessionalAppointment()
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [selectedAppointmentID, setSelectedAppointmentID] = useState<string | null>(null)
  const [cancellationReason, setCancellationReason] = useState('')

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
          <div className="loading">{t('professional.timetable.loading')}</div>
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
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <header className="header">
        <h1>📅 {t('professional.timetable.title')}</h1>
        <p className="subtitle">{formatDate(date, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </header>
      <div className="content">
        {error && <div className="error-message">{error}</div>}
        {cancelError && <div className="error-message">{cancelError}</div>}
        
        {!timetable || timetable.appointments.length === 0 ? (
          <div className="timetable-empty">
            <p>📋 {t('professional.timetable.empty', { date: formatDate(date, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) })}</p>
          </div>
        ) : (
          <div className="timetable-appointments">
            {timetable.appointments.map((apt, index) => (
              <div key={apt.id} className="timetable-slot">
                <div className="slot-header">
                  <span className="slot-number">📅 {t('professional.timetable.slot', { number: index + 1 })}</span>
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
                    ❌ {t('professional.timetable.cancelSlot', { number: index + 1 })}
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
              {t('common.previousDay')}
            </button>
          )}
          <button
            className="btn btn-secondary"
            onClick={handleNextDay}
            disabled={loading || canceling}
          >
            {t('common.nextDay')}
          </button>
        </div>

        <div className="actions">
          <button className="btn btn-secondary" onClick={onBack} disabled={canceling}>
            {t('common.backToDashboard')}
          </button>
        </div>

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
    </div>
  )
}
