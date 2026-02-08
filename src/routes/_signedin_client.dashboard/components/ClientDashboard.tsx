import { useTranslation } from 'react-i18next'
import { CalendarPlus, Users, Calendar, Mail, History, Package } from 'lucide-react'
import LanguageSelector from '../../../components/LanguageSelector'
import logo from '../../../assets/logo.png'
import './ClientDashboard.css'

interface ClientDashboardProps {
  user: any
  onBookAppointment: () => void
  onViewAppointments: () => void
  onViewProfessionals: () => void
  onViewInvites: () => void
  onViewPreviousAppointments: () => void
  onViewPackages: () => void
  onLocaleChange?: (locale: string) => Promise<void>
  invitesCount?: number
}

export default function ClientDashboard({ 
  user, 
  onBookAppointment,
  onViewAppointments,
  onViewProfessionals,
  onViewInvites,
  onViewPreviousAppointments,
  onViewPackages,
  onLocaleChange,
  invitesCount = 0
}: ClientDashboardProps) {
  const { t } = useTranslation()
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        <button 
          className="notification-icon-button" 
          onClick={onViewInvites}
          title={t('client.dashboard.invites')}
        >
          <Mail size={24} />
          {invitesCount > 0 && (
            <span className="notification-badge">{invitesCount > 99 ? '99+' : invitesCount}</span>
          )}
        </button>
        <LanguageSelector onLocaleChange={onLocaleChange} />
        <header className="dashboard-header">
          <img src={logo} alt="Logo" className="dashboard-logo" />
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
              onClick={onViewPreviousAppointments}
            >
              <History size={20} />
              {t('client.dashboard.previousAppointments')}
            </button>
            <button
              className="btn btn-secondary btn-large"
              onClick={onViewPackages}
            >
              <Package size={20} />
              {t('client.dashboard.packages')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
