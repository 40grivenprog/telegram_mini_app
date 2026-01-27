import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCreateUnavailableAppointment } from '../hooks/useCreateUnavailableAppointment'
import { formatDate, formatTime } from '../../../utils/i18n'
import './UnavailableDescription.css'

interface UnavailableDescriptionProps {
  professionalID: string
  date: string
  startTime: string
  endTime: string
  onConfirm: () => void
  onCancel: () => void
}

export default function UnavailableDescription({
  professionalID,
  date,
  startTime,
  endTime,
  onConfirm,
  onCancel,
}: UnavailableDescriptionProps) {
  const { t } = useTranslation()
  const [description, setDescription] = useState('')
  const { createUnavailableAppointment, creating, error } = useCreateUnavailableAppointment()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!description.trim()) {
      const tg = window.Telegram?.WebApp
      if (tg) {
        tg.showAlert(t('professional.setUnavailable.description.descriptionRequired'))
      }
      return
    }

    try {
      await createUnavailableAppointment({
        professional_id: professionalID,
        start_at: startTime,
        end_at: endTime,
        description: description.trim(),
      }, onConfirm)
    } catch {
      // Error is already handled by the hook
    }
  }

  return (
    <div className="container">
      <header className="header">
        <h1>{t('professional.setUnavailable.description.title')}</h1>
      </header>
      <div className="content">
        {error && <div className="error-message">{error}</div>}
        
        <div className="unavailable-summary">
          <p><strong>📅 {t('professional.setUnavailable.description.date')}:</strong> {formatDate(date)}</p>
          <p><strong>🕐 {t('professional.setUnavailable.description.time')}:</strong> {formatTime(startTime)} - {formatTime(endTime)}</p>
        </div>

        <form onSubmit={handleSubmit} className="description-form">
          <label htmlFor="description" className="form-label">
            {t('professional.setUnavailable.description.description')}
          </label>
          <textarea
            id="description"
            className="description-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('professional.setUnavailable.description.descriptionPlaceholder')}
            rows={4}
            disabled={creating}
            required
          />
          
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={creating || !description.trim()}
            >
              {creating ? t('common.creating') : t('common.create')}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={creating}
            >
              {t('common.back')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
