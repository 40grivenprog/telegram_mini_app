import React from 'react'
import { useTranslation } from 'react-i18next'
import { useProfessionalAvailability } from '../hooks/useProfessionalAvailability'
import { formatDate, formatTime } from '../../../utils/i18n'
import './SelectGroupVisitTime.css'

interface SelectGroupVisitTimeProps {
  professionalID: string
  date: string
  onSelect: (startTime: string, endTime: string) => void
  onCancel: () => void
}

export default function SelectGroupVisitTime({
  professionalID,
  date,
  onSelect,
  onCancel,
}: SelectGroupVisitTimeProps) {
  const { t } = useTranslation()
  const { availableSlots, loading, error, refetch } = useProfessionalAvailability(professionalID, date)

  if (loading) {
    return (
      <div className="container">
        <div className="loading-screen">
          <div className="loading">{t('professional.createGroupVisit.selectTime.loading')}</div>
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
        <h1>{t('professional.createGroupVisit.selectTime.titleStart')}</h1>
        <p className="subtitle">
          {t('professional.createGroupVisit.selectTime.dateLabel')}: {formatDate(date)}
        </p>
      </header>
      <div className="content">
        {availableSlots.length === 0 ? (
          <div className="no-slots">
            <p>{t('professional.createGroupVisit.selectTime.noSlots')}</p>
            <button className="btn btn-secondary" onClick={onCancel}>
              {t('common.back')}
            </button>
          </div>
        ) : (
          <>
            <div className="time-slots">
              {availableSlots.map((slot, index) => (
                <button
                  key={index}
                  className="time-slot-button"
                  onClick={() => onSelect(slot.start_time, slot.end_time)}
                >
                  {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                </button>
              ))}
            </div>
            <button className="btn btn-secondary" onClick={onCancel}>
              {t('common.cancel')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
