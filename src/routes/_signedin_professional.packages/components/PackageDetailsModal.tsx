import React from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, AlertCircle, Calendar, Hash, Tag, Clock } from 'lucide-react'
import { PackageDetails } from '../../../hooks/professionals/usePackages'
import { formatDate, formatTime } from '../../../utils/i18n'

interface PackageDetailsModalProps {
  packageDetails: PackageDetails | null
  loading: boolean
  error: string | null
  onClose: () => void
}

export default function PackageDetailsModal({
  packageDetails,
  loading,
  error,
  onClose,
}: PackageDetailsModalProps) {
  const { t } = useTranslation()

  const formatDateDisplay = (dateStr: string): string => {
    try {
      return formatDate(dateStr, { year: 'numeric', month: 'long', day: 'numeric' })
    } catch {
      return dateStr
    }
  }

  const renderAppointmentType = (type: string) => {
    if (type === 'personal') return t('professional.appointments.types.personal')
    if (type === 'split') return t('professional.appointments.types.split')
    if (type === 'group') return t('professional.appointments.types.group')
    return type
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="packages-status">
          <Loader2 size={32} className="spinner" />
          <p>{t('professional.packages.loadingDetails')}</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="packages-status packages-error">
          <AlertCircle size={32} />
          <p>{error}</p>
        </div>
      )
    }

    if (!packageDetails) return null

    const receivedCount = packageDetails.appointments?.length || 0
    const totalCount = packageDetails.apppointments_number

    return (
      <div className="package-details-content">
        <div className="package-details-info">
          <div className="detail-row">
            <Calendar size={16} />
            <span className="detail-label">{t('professional.packages.issuedAt')}:</span>
            <span className="detail-value">{formatDateDisplay(packageDetails.issued_at)}</span>
          </div>
          <div className="detail-row">
            <Calendar size={16} />
            <span className="detail-label">{t('professional.packages.expiresAt')}:</span>
            <span className="detail-value">{formatDateDisplay(packageDetails.expires_at)}</span>
          </div>
          <div className="detail-row">
            <Hash size={16} />
            <span className="detail-label">{t('professional.packages.appointments')}:</span>
            <span className={`detail-value appointments-count ${receivedCount >= totalCount ? 'complete' : ''}`}>
              {receivedCount}/{totalCount}
            </span>
          </div>
        </div>

        {packageDetails.appointments && packageDetails.appointments.length > 0 ? (
          <div className="package-appointments-section">
            <h3 className="package-section-title">{t('professional.packages.appointmentsList')}</h3>
            <div className="package-appointments-list">
              {packageDetails.appointments.map((apt) => (
                <div key={apt.id} className="package-appointment-item">
                  <div className="package-apt-type">
                    <Tag size={14} />
                    <span>{renderAppointmentType(apt.type)}</span>
                  </div>
                  <div className="package-apt-time">
                    <Clock size={14} />
                    <span>
                      {formatDateDisplay(apt.start_time)} · {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="packages-status-inline">
            <p>{t('professional.packages.noAppointmentsInPackage')}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
        <h2>{t('professional.packages.packageDetails')}</h2>
        {renderContent()}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  )
}
