import React from 'react'
import { useTranslation } from 'react-i18next'
import { useClientPreviousAppointments } from '../hooks/useClientPreviousAppointments'
import { formatDate, formatTime } from '../../../utils/i18n'
import './PreviousAppointments.css'

interface PreviousAppointmentsProps {
  onBack: () => void
}

export default function PreviousAppointments({ onBack }: PreviousAppointmentsProps) {
  const { t } = useTranslation()
  const { appointments, loading, error, pagination, page, setPage, refetch } = useClientPreviousAppointments(15, true)

  const getAppointmentTypeLabel = (type: string) => {
    switch (type) {
      case 'personal':
        return t('client.appointments.types.personal')
      case 'split':
        return t('client.appointments.types.split')
      case 'group':
        return t('client.appointments.types.group')
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="container">
        <header className="header">
          <button className="btn btn-back" onClick={onBack}>
            ← {t('common.back')}
          </button>
          <h1>📜 {t('client.previousAppointments.title')}</h1>
        </header>
        <div className="loading-screen">
          <div className="loading">{t('client.previousAppointments.loading')}</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <header className="header">
          <button className="btn btn-back" onClick={onBack}>
            ← {t('common.back')}
          </button>
          <h1>📜 {t('client.previousAppointments.title')}</h1>
        </header>
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
        <button className="btn btn-back" onClick={onBack}>
          ← {t('common.back')}
        </button>
        <h1>📜 {t('client.previousAppointments.title')}</h1>
      </header>
      <div className="content">
        {appointments.length === 0 ? (
          <div className="no-appointments">
            <p>{t('client.previousAppointments.noAppointments')}</p>
          </div>
        ) : (
          <>
            <div className="appointments-list">
              {appointments.map((apt) => (
                <div key={apt.id} className="appointment-card">
                  <div className="appointment-details">
                    <p className="professional-name">
                      <strong>👤 {t('common.professional')}:</strong> {apt.first_name} {apt.last_name}
                    </p>
                    <p className="appointment-date">
                      <strong>📅 {t('common.date')}:</strong> {formatDate(apt.start_time, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="appointment-time">
                      <strong>🕐 {t('common.time')}:</strong> {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                    </p>
                    <p className="appointment-type">
                      <strong>🏷️ {t('client.appointments.type')}:</strong> {getAppointmentTypeLabel(apt.type)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {pagination && (pagination.has_next_page || pagination.page > 1 || appointments.length >= pagination.page_size) && (
              <div className="pagination">
                <button
                  className="btn btn-secondary"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  {t('common.previous')}
                </button>
                <span className="page-info">
                  {t('common.page')} {pagination.page}
                </span>
                <button
                  className="btn btn-secondary"
                  disabled={!pagination.has_next_page}
                  onClick={() => setPage(page + 1)}
                >
                  {t('common.next')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
