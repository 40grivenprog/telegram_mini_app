import React from 'react'
import { useTranslation } from 'react-i18next'
import './ProfessionalDashboard.css'

interface ProfessionalDashboardProps {
  user: any
  onViewPendingAppointments: () => void
  onViewUpcomingAppointments: () => void
  onSetUnavailable: () => void
  onViewTimetable: () => void
  onViewPreviousAppointments: () => void
}

export default function ProfessionalDashboard({
  user,
  onViewPendingAppointments,
  onViewUpcomingAppointments,
  onSetUnavailable,
  onViewTimetable,
  onViewPreviousAppointments
}: ProfessionalDashboardProps) {
  const { t } = useTranslation()

  return (
    <div className="container">
      <header className="header">
        <h1>👋 {t('professional.dashboard.welcome', { name: user?.first_name || '' })}</h1>
      </header>
      <div className="content">
        <div className="dashboard-actions">
          <button
            className="btn btn-secondary btn-large"
            onClick={onViewPendingAppointments}
          >
            ⏳ {t('professional.dashboard.pendingAppointments')}
          </button>
          <button
            className="btn btn-secondary btn-large"
            onClick={onViewUpcomingAppointments}
          >
            📋 {t('professional.dashboard.upcomingAppointments')}
          </button>
          <button
            className="btn btn-secondary btn-large"
            onClick={onSetUnavailable}
          >
            🚫 {t('professional.dashboard.setUnavailable')}
          </button>
          <button
            className="btn btn-secondary btn-large"
            onClick={onViewTimetable}
          >
            📅 {t('professional.dashboard.timetable')}
          </button>
          <button
            className="btn btn-secondary btn-large"
            onClick={onViewPreviousAppointments}
          >
            📜 {t('professional.dashboard.previousAppointments')}
          </button>
        </div>
      </div>
    </div>
  )
}
