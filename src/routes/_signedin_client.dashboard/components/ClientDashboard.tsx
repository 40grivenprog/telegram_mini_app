import { useTranslation } from 'react-i18next'
import { CalendarPlus, Users, Calendar, Mail, History } from 'lucide-react'
import LanguageSelector from '../../../components/LanguageSelector'
import './ClientDashboard.css'

interface ClientDashboardProps {
  user: any
  onBookAppointment: () => void
  onViewAppointments: () => void
  onViewProfessionals: () => void
  onViewInvites: () => void
  onViewPreviousAppointments: () => void
  onLocaleChange?: (locale: string) => Promise<void>
}

export default function ClientDashboard({ 
  user, 
  onBookAppointment,
  onViewAppointments,
  onViewProfessionals,
  onViewInvites,
  onViewPreviousAppointments,
  onLocaleChange
}: ClientDashboardProps) {
  const { t } = useTranslation()
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        <LanguageSelector onLocaleChange={onLocaleChange} />
        <header className="dashboard-header">
          <h1>👋 {t('client.dashboard.welcome', { name: user?.first_name || '' })}</h1>
        </header>
        <div className="dashboard-content">
          <div className="dashboard-actions">
            <button
              className="btn btn-primary btn-large"
              onClick={onBookAppointment}
            >
              <CalendarPlus size={20} />
              {t('client.dashboard.bookAppointment')}
            </button>
            <button
              className="btn btn-secondary btn-large"
              onClick={onViewProfessionals}
            >
              <Users size={20} />
              {t('client.dashboard.professionals')}
            </button>
            <button
              className="btn btn-secondary btn-large"
              onClick={onViewAppointments}
            >
              <Calendar size={20} />
              {t('client.dashboard.appointments')}
            </button>
            <button
              className="btn btn-secondary btn-large"
              onClick={onViewInvites}
            >
              <Mail size={20} />
              {t('client.dashboard.invites')}
            </button>
            <button
              className="btn btn-secondary btn-large"
              onClick={onViewPreviousAppointments}
            >
              <History size={20} />
              {t('client.dashboard.previousAppointments')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
