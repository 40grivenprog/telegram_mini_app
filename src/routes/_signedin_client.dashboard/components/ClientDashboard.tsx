import React from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSelector from '../../../components/LanguageSelector'
import './ClientDashboard.css'

interface ClientDashboardProps {
  user: any
  onBookAppointment: () => void
  onViewPendingAppointments: () => void
  onViewUpcomingAppointments: () => void
  onLocaleChange?: (locale: string) => Promise<void>
}

export default function ClientDashboard({ 
  user, 
  onBookAppointment,
  onViewPendingAppointments,
  onViewUpcomingAppointments,
  onLocaleChange
}: ClientDashboardProps) {
  const { t } = useTranslation()
  
  return (
    <div className="container">
      <LanguageSelector onLocaleChange={onLocaleChange} />
      <header className="header">
        <h1>👋 {t('client.dashboard.welcome', { name: user?.first_name || '' })}</h1>
      </header>
      <div className="content">
        <div className="dashboard-actions">
          <button
            className="btn btn-primary btn-large"
            onClick={onBookAppointment}
          >
            📅 {t('client.dashboard.bookAppointment')}
          </button>
          <button
            className="btn btn-secondary btn-large"
            onClick={onViewPendingAppointments}
          >
            ⏳ {t('client.dashboard.pendingAppointments')}
          </button>
          <button
            className="btn btn-secondary btn-large"
            onClick={onViewUpcomingAppointments}
          >
            📋 {t('client.dashboard.upcomingAppointments')}
          </button>
        </div>
      </div>
    </div>
  )
}
