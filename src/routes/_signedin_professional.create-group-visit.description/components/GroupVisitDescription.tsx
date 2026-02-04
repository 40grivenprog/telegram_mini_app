import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCreateGroupVisitAppointment } from '../hooks/useCreateGroupVisitAppointment'
import { formatDate, formatTime } from '../../../utils/i18n'
import './GroupVisitDescription.css'

interface GroupVisitDescriptionProps {
  professionalID: string
  date: string
  startTime: string
  endTime: string
  onConfirm: () => void
  onCancel: () => void
}

export default function GroupVisitDescription({
  professionalID,
  date,
  startTime,
  endTime,
  onConfirm,
  onCancel,
}: GroupVisitDescriptionProps) {
  const { t } = useTranslation()
  const [description, setDescription] = useState('')
  const { createGroupVisitAppointment, creating, error } = useCreateGroupVisitAppointment()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!description.trim()) {
      const tg = window.Telegram?.WebApp
      if (tg) {
        tg.showAlert(t('professional.createGroupVisit.description.descriptionRequired'))
      }
      return
    }

    try {
      await createGroupVisitAppointment({
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
        <h1>{t('professional.createGroupVisit.description.title')}</h1>
      </header>
      <div className="content">
        {error && <div className="error-message">{error}</div>}
        
        <div className="group-visit-summary">
          <p><strong>📅 {t('professional.createGroupVisit.description.date')}:</strong> {formatDate(date)}</p>
          <p><strong>🕐 {t('professional.createGroupVisit.description.time')}:</strong> {formatTime(startTime)} - {formatTime(endTime)}</p>
        </div>

        <form onSubmit={handleSubmit} className="description-form">
          <label htmlFor="description" className="form-label">
            {t('professional.createGroupVisit.description.description')}
          </label>
          <textarea
            id="description"
            className="description-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('professional.createGroupVisit.description.descriptionPlaceholder')}
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
