import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Package, Loader2, AlertCircle, Calendar, User, Hash } from 'lucide-react'
import { useClientPackages, ClientPackageListItem } from '../../../hooks/clients/useClientPackages'
import ClientPackageDetailsModal from './ClientPackageDetailsModal'
import { formatDate } from '../../../utils/i18n'
import './Packages.css'

export default function Packages() {
  const { t } = useTranslation()
  const {
    packages,
    loading,
    error,
    refetch,
    packageDetails,
    detailsLoading,
    detailsError,
    fetchPackageDetails,
    clearDetails,
  } = useClientPackages()

  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)
  const [selectedProfessionalName, setSelectedProfessionalName] = useState<{ firstName: string; lastName: string } | null>(null)

  const handlePackageClick = (pkg: ClientPackageListItem) => {
    setSelectedPackageId(pkg.id)
    setSelectedProfessionalName({ firstName: pkg.first_name, lastName: pkg.last_name })
    fetchPackageDetails(pkg.id)
  }

  const handleCloseDetails = () => {
    setSelectedPackageId(null)
    setSelectedProfessionalName(null)
    clearDetails()
  }

  const formatDateDisplay = (dateStr: string): string => {
    try {
      return formatDate(dateStr, { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      return dateStr
    }
  }

  const renderPackagesList = () => {
    if (loading) {
      return (
        <div className="packages-status">
          <Loader2 size={32} className="spinner" />
          <p>{t('client.packages.loading')}</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="packages-status packages-error">
          <AlertCircle size={32} />
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={refetch}>
            {t('common.tryAgain')}
          </button>
        </div>
      )
    }

    if (packages.length === 0) {
      return (
        <div className="packages-status">
          <Package size={40} className="empty-icon" />
          <p>{t('client.packages.noPackages')}</p>
        </div>
      )
    }

    return (
      <div className="packages-list">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="package-card"
            onClick={() => handlePackageClick(pkg)}
          >
            <div className="package-card-header">
              <div className="package-client-info">
                <User size={16} />
                <span className="package-client-name">
                  {pkg.first_name} {pkg.last_name}
                </span>
              </div>
              <div className="package-appointments-badge">
                <Hash size={14} />
                {pkg.apppointments_number}
              </div>
            </div>
            <div className="package-card-dates">
              <div className="package-date">
                <Calendar size={14} />
                <span>{formatDateDisplay(pkg.issued_at)} — {formatDateDisplay(pkg.expires_at)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="packages-container">
      <div className="packages-wrapper">
        <header className="packages-header">
          <h1>{t('client.packages.title')}</h1>
        </header>

        <div className="packages-content">
          {renderPackagesList()}
        </div>
      </div>

      {selectedPackageId && selectedProfessionalName && (
        <ClientPackageDetailsModal
          packageDetails={packageDetails}
          professionalFirstName={selectedProfessionalName.firstName}
          professionalLastName={selectedProfessionalName.lastName}
          loading={detailsLoading}
          error={detailsError}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  )
}
