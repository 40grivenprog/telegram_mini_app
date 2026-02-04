import React, { useState } from 'react'
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
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null)

  const parseTime = (timeStr: string): number => {
    try {
      const date = new Date(timeStr)
      return date.getTime()
    } catch {
      return 0
    }
  }

  const getAvailableEndTimes = () => {
    if (!selectedStartTime) return []
    const startTime = parseTime(selectedStartTime)
    
    return availableSlots.filter((slot) => {
      const slotStart = parseTime(slot.start_time)
      return slotStart >= startTime && slot.available
    })
  }

  const handleStartTimeSelect = (startTime: string) => {
    setSelectedStartTime(startTime)
  }

  const handleEndTimeSelect = (endTime: string) => {
    if (!selectedStartTime) return
    
    const endSlot = availableSlots.find((slot) => slot.end_time === endTime && slot.available)
    if (endSlot) {
      onSelect(selectedStartTime, endTime)
    }
  }

  const handleBackToStart = () => {
    setSelectedStartTime(null)
  }

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

  const availableEndTimes = getAvailableEndTimes()

  return (
    <div className="container">
      <header className="header">
        <h1>{selectedStartTime ? t('professional.createGroupVisit.selectTime.titleEnd') : t('professional.createGroupVisit.selectTime.titleStart')}</h1>
        <p className="subtitle">
          {t('professional.createGroupVisit.selectTime.dateLabel')}: {formatDate(date)}
          {selectedStartTime && (
            <>
              <br />
              {t('professional.createGroupVisit.selectTime.startTimeLabel')}: {formatTime(selectedStartTime)}
            </>
          )}
        </p>
      </header>
      <div className="content">
        {!selectedStartTime ? (
          <>
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
                      onClick={() => handleStartTimeSelect(slot.start_time)}
                    >
                      {formatTime(slot.start_time)}
                    </button>
                  ))}
                </div>
                <button className="btn btn-secondary" onClick={onCancel}>
                  {t('common.cancel')}
                </button>
              </>
            )}
          </>
        ) : (
          <>
            {availableEndTimes.length === 0 ? (
              <div className="no-slots">
                <p>{t('professional.createGroupVisit.selectTime.noEndTimes')}</p>
                <button className="btn btn-secondary" onClick={handleBackToStart}>
                  {t('professional.createGroupVisit.selectTime.backToStart')}
                </button>
              </div>
            ) : (
              <>
                <div className="time-slots">
                  {availableEndTimes.map((slot, index) => (
                    <button
                      key={index}
                      className="time-slot-button"
                      onClick={() => handleEndTimeSelect(slot.end_time)}
                    >
                      {formatTime(slot.end_time)}
                    </button>
                  ))}
                </div>
                <button className="btn btn-secondary" onClick={handleBackToStart}>
                  {t('professional.createGroupVisit.selectTime.backToStart')}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
