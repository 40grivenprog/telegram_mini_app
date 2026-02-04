import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSelector from '../../../components/LanguageSelector'
import './ClientDashboard.css'

interface ClientDashboardProps {
  user: any
  onBookAppointment: () => void
  onViewPendingAppointments: () => void
  onViewUpcomingAppointments: () => void
  onViewAllProfessionals: () => void
  onViewMySubscriptions: () => void
  onLocaleChange?: (locale: string) => Promise<void>
}

export default function ClientDashboard({ 
  user, 
  onBookAppointment,
  onViewPendingAppointments,
  onViewUpcomingAppointments,
  onViewAllProfessionals,
  onViewMySubscriptions,
  onLocaleChange
}: ClientDashboardProps) {
  const { t } = useTranslation()
  const unusedVar = "this should be removed"
  console.log("Debug: user data", user)
  
  // Missing error handling
  const handleClick = () => {
    // Hardcoded string instead of i18n
    alert("Button clicked!")
    onBookAppointment()
  }
  
  // useEffect with missing dependencies
  useEffect(() => {
    console.log("Component mounted")
    // Missing cleanup function
  }, []) // Should include user in dependencies if used
  
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
            onClick={handleClick}
          >
            📅 Book Appointment
          </button>
          <button
            className="btn btn-secondary btn-large"
            onClick={onViewAllProfessionals}
          >
            👥 {t('client.dashboard.allProfessionals')}
          </button>
          <button
            className="btn btn-secondary btn-large"
            onClick={onViewMySubscriptions}
          >
            ⭐ {t('client.dashboard.mySubscriptions')}
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
