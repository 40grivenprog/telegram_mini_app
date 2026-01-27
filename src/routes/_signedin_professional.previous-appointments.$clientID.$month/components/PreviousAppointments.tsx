import React from 'react'
import { useTranslation } from 'react-i18next'
import { usePreviousAppointmentsByClient } from '../hooks/usePreviousAppointmentsByClient'
import { formatDate, formatTime } from '../../../utils/i18n'
import './PreviousAppointments.css'

interface PreviousAppointmentsProps {
  professionalID: string
  clientID: string
  clientName: string
  month: string // Format: YYYY-MM
  onBack: () => void
  onMonthChange: (newMonth: string) => void
}

export default function PreviousAppointments({
  professionalID,
  clientID,
  clientName,
  month,
  onBack,
  onMonthChange,
}: PreviousAppointmentsProps) {
  const { t } = useTranslation()
  const { appointments, loading, error, refetch } = usePreviousAppointmentsByClient(professionalID, clientID, month)
  const formatMonth = (monthStr: string) => {
    try {
      const [year, monthValue] = monthStr.split('-')
      const dateObj = new Date(parseInt(year), parseInt(monthValue) - 1, 1)
      return formatDate(dateObj, { year: 'numeric', month: 'long' })
    } catch {
      return monthStr
    }
  }

  const handlePrevMonth = () => {
    const [year, monthNum] = month.split('-').map(Number)
    const currentDate = new Date(year, monthNum - 1, 1)
    currentDate.setMonth(currentDate.getMonth() - 1)
    const newMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    onMonthChange(newMonth)
  }

  const handleNextMonth = () => {
    const [year, monthNum] = month.split('-').map(Number)
    const currentDate = new Date(year, monthNum - 1, 1)
    currentDate.setMonth(currentDate.getMonth() + 1)
    const newMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
    onMonthChange(newMonth)
  }

  const handleCurrentMonth = () => {
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
    onMonthChange(currentMonth)
  }

  const currentMonth = new Date().toISOString().slice(0, 7)
  const isCurrentMonth = month === currentMonth

  if (loading) {
    return (
      <div className="container">
        <div className="loading-screen">
          <div className="loading">{t('common.loading')}</div>
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
        <h1>📜 {t('professional.previousAppointments.byClient.title')}</h1>
        <p className="subtitle">
          {clientName && t('professional.previousAppointments.byClient.clientLabel', { name: clientName })}
          <br />
          {formatMonth(month)}
        </p>
      </header>
      <div className="content">
        {appointments.length === 0 ? (
          <div className="empty-state">
            <p>{t('professional.previousAppointments.byClient.emptyMonth')}</p>
          </div>
        ) : (
          <div className="appointments-list">
            {appointments.map((apt) => (
              <div key={apt.id} className="appointment-card">
                <div className="appointment-details">
                  <p className="appointment-date">📅 {formatDate(apt.start_time, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="appointment-time">
                    🕐 {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                  </p>
                  {apt.description && (
                    <p className="appointment-description">📝 {apt.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="month-navigation">
          <button
            className="btn btn-secondary"
            onClick={handlePrevMonth}
            disabled={loading}
          >
            {t('common.previousMonth')}
          </button>
          {!isCurrentMonth && (
            <button
              className="btn btn-secondary"
              onClick={handleCurrentMonth}
              disabled={loading}
            >
              {t('common.currentMonth')}
            </button>
          )}
          <button
            className="btn btn-secondary"
            onClick={handleNextMonth}
            disabled={loading}
          >
            {t('common.nextMonth')}
          </button>
        </div>

        <div className="actions">
          <button className="btn btn-secondary" onClick={onBack}>
            {t('common.backToClientSelection')}
          </button>
        </div>
      </div>
    </div>
  )
}
