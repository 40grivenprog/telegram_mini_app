import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Package, Plus, Loader2, AlertCircle, Calendar, User, Hash } from 'lucide-react'
import { usePackages, PackageListItem } from '../../../hooks/professionals/usePackages'
import CreatePackageModal from './CreatePackageModal'
import PackageDetailsModal from './PackageDetailsModal'
import { formatDate } from '../../../utils/i18n'
import './Packages.css'

interface PackagesProps {
  professionalID: string
}

export default function Packages({ professionalID }: PackagesProps) {
  const { t } = useTranslation()
  const {
    packages,
    loading,
    error,
    refetch,
    createPackage,
    packageDetails,
    detailsLoading,
    detailsError,
    fetchPackageDetails,
    clearDetails,
  } = usePackages()
  console.log("packages", packages)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)

  const handlePackageClick = (pkg: PackageListItem) => {
    setSelectedPackageId(pkg.id)
    fetchPackageDetails(pkg.id)
  }

  const handleCloseDetails = () => {
    setSelectedPackageId(null)
    clearDetails()
  }

  const handleCreateSuccess = () => {
    setShowCreateModal(false)
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
          <p>{t('professional.packages.loading')}</p>
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
          <p>{t('professional.packages.noPackages')}</p>
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
          <h1>{t('professional.packages.title')}</h1>
          <button
            className="btn btn-primary btn-create-package"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={18} />
            {t('professional.packages.createPackage')}
          </button>
        </header>

        <div className="packages-content">
          {renderPackagesList()}
        </div>
      </div>

      {showCreateModal && (
        <CreatePackageModal
          professionalID={professionalID}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
          createPackage={createPackage}
        />
      )}

      {selectedPackageId && (
        <PackageDetailsModal
          packageDetails={packageDetails}
          loading={detailsLoading}
          error={detailsError}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  )
}
