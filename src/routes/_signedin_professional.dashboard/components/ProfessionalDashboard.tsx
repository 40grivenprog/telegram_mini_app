import React from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSelector from '../../../components/LanguageSelector'
import './ProfessionalDashboard.css'

interface ProfessionalDashboardProps {
  user: any
  onViewAppointments: () => void
  onSetUnavailable: () => void
  onViewTimetable: () => void
  onViewPreviousAppointments: () => void
  onCreateGroupVisit: () => void
  onLocaleChange?: (locale: string) => Promise<void>
}

export default function ProfessionalDashboard({
  user,
  onViewAppointments,
  onSetUnavailable,
  onViewTimetable,
  onViewPreviousAppointments,
  onCreateGroupVisit,
  onLocaleChange
}: ProfessionalDashboardProps) {
  const { t } = useTranslation()

  return (
    <div className="container">
      <LanguageSelector onLocaleChange={onLocaleChange} />
      <header className="header">
        <h1>👋 {t('professional.dashboard.welcome', { name: user?.first_name || '' })}</h1>
      </header>
      <div className="content">
        <div className="dashboard-actions">
          <button
            className="btn btn-secondary btn-large"
            onClick={onViewAppointments}
          >
            📋 {t('professional.dashboard.appointments')}
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
          <button
            className="btn btn-primary btn-large"
            onClick={onCreateGroupVisit}
          >
            👥 {t('professional.dashboard.createGroupVisit')}
          </button>
        </div>
      </div>
    </div>
  )
}
