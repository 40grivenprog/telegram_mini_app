import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Clock, Loader2, AlertCircle, CalendarPlus, Calendar, Check, FileText } from 'lucide-react'
import { useSetUnavailable } from '../hooks/useSetUnavailable'
import { generateAvailableDates } from '../../../utils/date'
import { formatDate, formatTime } from '../../../utils/i18n'
import './SetUnavailable.css'

interface SetUnavailableProps {
  professionalID: string
}

export default function SetUnavailable({ professionalID }: SetUnavailableProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const {
    selectedDate,
    setSelectedDate,
    availableSlots,
    slotsLoading,
    slotsError,
    selectedStartTime,
    setSelectedStartTime,
    selectedEndTime,
    setSelectedEndTime,
    description,
    setDescription,
    createUnavailable,
    creating,
    error,
  } = useSetUnavailable(professionalID)

  const dates = generateAvailableDates(currentMonth)
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const isCurrentMonth = currentMonth.getMonth() === today.getMonth() &&
    currentMonth.getFullYear() === today.getFullYear()

  // Set pre-defined description when end time is selected
  useEffect(() => {
    if (selectedEndTime) {
      setDescription(t('professional.setUnavailable.predefinedDescription'))
    }
  }, [selectedEndTime, t, setDescription])

  // Get available end times based on selected start time
  const getAvailableEndTimes = () => {
    if (!selectedStartTime) return []
    const startTime = parseTime(selectedStartTime)
    
    return availableSlots.filter((slot) => {
      const slotStart = parseTime(slot.start_time)
      const slotEnd = parseTime(slot.end_time)
      // End time slots that start after the selected start time
      return slotStart >= startTime && slot.available
    })
  }

  const parseTime = (timeStr: string): number => {
    try {
      const date = new Date(timeStr)
      return date.getTime()
    } catch {
      return 0
    }
  }

  const handlePrevMonth = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    setCurrentMonth(prev)
    setSelectedDate(null)
  }

  const handleNextMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    setCurrentMonth(next)
    setSelectedDate(null)
  }

  const handleStartTimeSelect = (startTime: string) => {
    setSelectedStartTime(startTime)
  }

  const handleEndTimeSelect = (endTime: string) => {
    if (!selectedStartTime) return
    setSelectedEndTime(endTime)
  }

  const handleConfirm = async () => {
    if (!description.trim()) {
      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.showAlert(t('professional.setUnavailable.description.descriptionRequired'))
      }
      return
    }
    await createUnavailable(() => {
      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.showAlert(t('common.unavailableCreated'))
      }
      navigate('/professional/dashboard', { replace: true })
    })
  }

  const canConfirm = selectedDate && selectedStartTime && selectedEndTime && description.trim()

  const availableEndTimes = getAvailableEndTimes()

  return (
    <div className="su-container">
      <div className="su-wrapper">
        <header className="su-header">
          <h1>{t('professional.setUnavailable.title')}</h1>
        </header>

        {/* Calendar */}
        <section className="su-section">
          <div className="calendar-header">
            <button
              className="btn-month-nav"
              disabled={isCurrentMonth}
              onClick={handlePrevMonth}
            >
              <ChevronLeft size={20} />
            </button>
            <span className="calendar-month">
              {formatDate(currentMonth, { month: 'long', year: 'numeric' })}
            </span>
            <button className="btn-month-nav" onClick={handleNextMonth}>
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="calendar-grid">
            {dates.map((date) => {
              const dateObj = new Date(date + 'T00:00:00')
              const day = dateObj.getDate()
              const weekday = formatDate(dateObj, { weekday: 'short' })
              const isSelected = date === selectedDate
              const isToday = date === todayStr

              return (
                <button
                  key={date}
                  className={`calendar-day${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}`}
                  onClick={() => setSelectedDate(date)}
                >
                  <span className="day-number">{day}</span>
                  <span className="day-weekday">{weekday}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Start Time */}
        {selectedDate && (
          <section className="su-section">
            <label className="su-label">
              <Clock size={16} />
              {selectedStartTime ? t('professional.setUnavailable.selectTime.titleEnd') : t('professional.setUnavailable.selectTime.titleStart')}
            </label>

            {slotsLoading ? (
              <div className="slots-status">
                <Loader2 size={24} className="spinner" />
              </div>
            ) : slotsError ? (
              <div className="slots-status slots-error">
                <AlertCircle size={20} />
                <span>{slotsError}</span>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="slots-status">
                <p>{t('professional.setUnavailable.selectTime.noSlots')}</p>
              </div>
            ) : !selectedStartTime ? (
              <div className="slots-grid">
                {availableSlots.map((slot, i) => (
                  <button
                    key={i}
                    className="slot-btn"
                    onClick={() => handleStartTimeSelect(slot.start_time)}
                  >
                    {formatTime(slot.start_time)}
                  </button>
                ))}
              </div>
            ) : (
              <>
                {availableEndTimes.length === 0 ? (
                  <div className="slots-status">
                    <p>{t('professional.setUnavailable.selectTime.noEndTimes')}</p>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setSelectedStartTime(null)}
                    >
                      {t('professional.setUnavailable.selectTime.backToStart')}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="slots-grid">
                      {availableEndTimes.map((slot, i) => {
                        const isSelected = selectedEndTime === slot.end_time
                        return (
                          <button
                            key={i}
                            className={`slot-btn${isSelected ? ' selected' : ''}`}
                            onClick={() => handleEndTimeSelect(slot.end_time)}
                          >
                            {formatTime(slot.end_time)}
                          </button>
                        )
                      })}
                    </div>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setSelectedStartTime(null)}
                    >
                      {t('professional.setUnavailable.selectTime.backToStart')}
                    </button>
                  </>
                )}
              </>
            )}
          </section>
        )}

        {/* Description */}
        {selectedEndTime && (
          <section className="su-section">
            <label className="su-label">
              <FileText size={16} />
              {t('professional.setUnavailable.description.description')}
            </label>
            <textarea
              className="su-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('professional.setUnavailable.description.descriptionPlaceholder')}
              rows={3}
              disabled={creating}
            />
          </section>
        )}

        {/* Summary */}
        {(selectedDate || selectedStartTime || selectedEndTime) && (
          <section className="su-summary">
            <div className="summary-row">
              <Calendar size={16} />
              <span className="summary-label">{t('common.date')}</span>
              <span className={`summary-value${selectedDate ? ' filled' : ''}`}>
                {selectedDate
                  ? <><Check size={14} className="check-icon" /> {formatDate(new Date(selectedDate + 'T00:00:00'), { weekday: 'short', day: 'numeric', month: 'short' })}</>
                  : '—'}
              </span>
            </div>
            <div className="summary-row">
              <Clock size={16} />
              <span className="summary-label">{t('common.time')}</span>
              <span className={`summary-value${selectedStartTime && selectedEndTime ? ' filled' : ''}`}>
                {selectedStartTime && selectedEndTime
                  ? <><Check size={14} className="check-icon" /> {formatTime(selectedStartTime)} – {formatTime(selectedEndTime)}</>
                  : '—'}
              </span>
            </div>
            <div className="summary-row">
              <FileText size={16} />
              <span className="summary-label">{t('common.description')}</span>
              <span className={`summary-value${description.trim() ? ' filled' : ''}`}>
                {description.trim()
                  ? <><Check size={14} className="check-icon" /> {description.trim().length > 30 ? description.trim().substring(0, 30) + '…' : description.trim()}</>
                  : '—'}
              </span>
            </div>
          </section>
        )}

        {/* Error */}
        {error && (
          <div className="su-error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Confirm */}
        {canConfirm && (
          <button
            className="btn-confirm"
            onClick={handleConfirm}
            disabled={creating}
          >
            {creating
              ? <><Loader2 size={18} className="spinner" /> {t('common.creating')}</>
              : <><CalendarPlus size={18} /> {t('common.create')}</>}
          </button>
        )}
      </div>
    </div>
  )
}
