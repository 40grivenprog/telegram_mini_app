import React from 'react'
import { useTranslation } from 'react-i18next'
import { useCreateAppointment } from '../hooks/useCreateAppointment'
import { formatTime, formatDate } from '../../../utils/i18n'
import './ConfirmAppointment.css'

interface ConfirmAppointmentProps {
  clientID: string
  professionalID: string
  professionalName: string
  date: string
  startTime: string
  endTime: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmAppointment({
  clientID,
  professionalID,
  professionalName,
  date,
  startTime,
  endTime,
  onConfirm,
  onCancel
}: ConfirmAppointmentProps) {
  const { t } = useTranslation()
  const { createAppointment, creating, error } = useCreateAppointment()

  const handleConfirm = async () => {
    try {
      await createAppointment({
        professional_id: professionalID,
        start_time: startTime,
        end_time: endTime,
      }, onConfirm)
    } catch {
      // Error is already handled by the hook
    }
  }

  return (
    <div className="container">
      <header className="header">
        <h1>{t('client.book.confirm.title')}</h1>
      </header>
      <div className="content">
        {error && <div className="error-message">{error}</div>}
        <div className="booking-summary">
          <p><strong>{t('common.professional')}:</strong> {professionalName}</p>
          <p><strong>{t('common.date')}:</strong> {formatDate(date)}</p>
          <p><strong>{t('common.time')}:</strong> {formatTime(startTime)} - {formatTime(endTime)}</p>
        </div>
        <div className="confirm-actions">
          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={creating}
          >
            {creating ? t('common.creating') : t('common.confirm')}
          </button>
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={creating}
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    </div>
  )
}
