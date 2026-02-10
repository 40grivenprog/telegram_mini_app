import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Clock, Loader2, AlertCircle, CalendarPlus, Users, Calendar, Check } from 'lucide-react'
import { useBooking } from '../hooks/useBooking'
import { generateAvailableDates } from '../../../utils/date'
import { formatDate, formatTime } from '../../../utils/i18n'
import './BookAppointment.css'

export default function BookAppointment() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const {
    coaches,
    coachesLoading,
    availableSlots,
    slotsLoading,
    slotsError,
    createBooking,
    creating,
    bookingError,
    selectedCoach,
    setSelectedCoach,
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
  } = useBooking()

  // Auto-select coach if there's only one
  useEffect(() => {
    if (!coachesLoading && coaches.length === 1 && !selectedCoach) {
      setSelectedCoach(coaches[0])
    }
  }, [coachesLoading, coaches, selectedCoach, setSelectedCoach])

  const dates = generateAvailableDates(currentMonth)
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const isCurrentMonth = currentMonth.getMonth() === today.getMonth() &&
    currentMonth.getFullYear() === today.getFullYear()

  const handleCoachChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const coach = coaches.find(c => c.id === e.target.value) || null
    setSelectedCoach(coach)
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

  const handleConfirm = async () => {
    await createBooking(() => {
      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.showAlert(t('common.appointmentCreated'))
      }
      navigate('/client/dashboard', { replace: true })
    })
  }

  return (
    <div className="book-container">
      <div className="book-wrapper">
        <header className="book-header">
          <h1>{t('client.book.title')}</h1>
        </header>

        {/* Coach selector */}
        <section className="book-section">
          <label className="book-label">
            <Users size={16} />
            {t('client.book.selectCoach')}
          </label>
          {coachesLoading ? (
            <div className="book-select-loading">
              <Loader2 size={18} className="spinner" />
            </div>
          ) : coaches.length === 0 ? (
            <p className="book-empty-hint">{t('client.book.noCoaches')}</p>
          ) : (
            <select
              className="book-select"
              value={selectedCoach?.id || ''}
              onChange={handleCoachChange}
            >
              <option value="">{t('client.book.chooseCoach')}</option>
              {coaches.map(c => (
                <option key={c.id} value={c.id}>
                  {c.first_name} {c.last_name}
                </option>
              ))}
            </select>
          )}
        </section>

        {/* Calendar */}
        <section className="book-section">
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

        {/* Available slots */}
        {selectedCoach && selectedDate && (
          <section className="book-section">
            <label className="book-label">
              <Clock size={16} />
              {t('client.book.availableSlots')}
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
                <p>{t('client.book.noSlots')}</p>
              </div>
            ) : (
              <div className="slots-grid">
                {availableSlots.map((slot, i) => {
                  const isSelected = selectedSlot?.start_time === slot.start_time
                    && selectedSlot?.end_time === slot.end_time
                  return (
                    <button
                      key={i}
                      className={`slot-btn${isSelected ? ' selected' : ''}`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                    </button>
                  )
                })}
              </div>
            )}
          </section>
        )}
        {/* Booking summary */}
        {(selectedCoach || selectedDate || selectedSlot) && (
          <section className="booking-summary">
            <div className="summary-row">
              <Users size={16} />
              <span className="summary-label">{t('client.book.selectCoach')}</span>
              <span className={`summary-value${selectedCoach ? ' filled' : ''}`}>
                {selectedCoach
                  ? <><Check size={14} className="check-icon" /> {selectedCoach.first_name} {selectedCoach.last_name}</>
                  : '—'}
              </span>
            </div>
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
              <span className={`summary-value${selectedSlot ? ' filled' : ''}`}>
                {selectedSlot
                  ? <><Check size={14} className="check-icon" /> {formatTime(selectedSlot.start_time)} – {formatTime(selectedSlot.end_time)}</>
                  : '—'}
              </span>
            </div>
          </section>
        )}

        {/* Error */}
        {bookingError && (
          <div className="booking-error">
            <AlertCircle size={16} />
            {bookingError}
          </div>
        )}

        {/* Confirm */}
        {selectedCoach && selectedDate && selectedSlot && (
          <button
            className="btn-confirm"
            onClick={handleConfirm}
            disabled={creating}
          >
            {creating
              ? <><Loader2 size={18} className="spinner" /> {t('common.creating')}</>
              : <><CalendarPlus size={18} /> {t('client.book.confirmBooking')}</>}
          </button>
        )}
      </div>
    </div>
  )
}
