import React from 'react'
import { useTranslation } from 'react-i18next'
import { Users, Calendar, CalendarX, History } from 'lucide-react'
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
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        <LanguageSelector onLocaleChange={onLocaleChange} />
        <header className="dashboard-header">
          <h1>{t('professional.dashboard.welcome', { name: user?.first_name || '' })}</h1>
        </header>
        <div className="dashboard-content">
          <div className="dashboard-actions">
            <button
              className="btn btn-primary btn-large"
              onClick={onCreateGroupVisit}
            >
              <Users size={20} />
              {t('professional.dashboard.createGroupVisit')}
            </button>
            <button
              className="btn btn-secondary btn-large"
              onClick={onViewAppointments}
            >
              <Calendar size={20} />
              {t('professional.dashboard.appointments')}
            </button>
            <button
              className="btn btn-secondary btn-large"
              onClick={onSetUnavailable}
            >
              <CalendarX size={20} />
              {t('professional.dashboard.setUnavailable')}
            </button>
            <button
              className="btn btn-secondary btn-large"
              onClick={onViewTimetable}
            >
              <Calendar size={20} />
              {t('professional.dashboard.timetable')}
            </button>
            <button
              className="btn btn-secondary btn-large"
              onClick={onViewPreviousAppointments}
            >
              <History size={20} />
              {t('professional.dashboard.previousAppointments')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
