import { useState, useCallback, useEffect } from 'react'
import { apiService } from '../../services/api'
import i18n from '../../i18n/config.js'

export interface ClientPackageListItem {
  id: string
  first_name: string
  last_name: string
  issued_at: string
  expires_at: string
  apppointments_number: number
}

export interface ClientPackageDetailsAppointment {
  id: string
  start_time: string
  end_time: string
  type: string
}

export interface ClientPackageDetails {
  id: string
  issued_at: string
  expires_at: string
  apppointments_number: number
  first_name: string
  last_name: string
  appointments: ClientPackageDetailsAppointment[]
}

interface UseClientPackagesResult {
  packages: ClientPackageListItem[]
  loading: boolean
  error: string | null
  refetch: () => void
  packageDetails: ClientPackageDetails | null
  detailsLoading: boolean
  detailsError: string | null
  fetchPackageDetails: (packageId: string) => Promise<void>
  clearDetails: () => void
}

export function useClientPackages(): UseClientPackagesResult {
  const [packages, setPackages] = useState<ClientPackageListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [packageDetails, setPackageDetails] = useState<ClientPackageDetails | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState<string | null>(null)

  const loadPackages = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiService.getClientPackages() as { packages: ClientPackageListItem[] }
      setPackages(data.packages || [])
    } catch (err: any) {
      setError(err.message || i18n.t('error.loadPackagesFailed'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPackages()
  }, [loadPackages])

  const fetchPackageDetails = useCallback(async (packageId: string) => {
    setDetailsLoading(true)
    setDetailsError(null)
    try {
      const data = await apiService.getClientPackageDetails(packageId) as ClientPackageDetails
      setPackageDetails(data)
    } catch (err: any) {
      setDetailsError(err.message || i18n.t('error.loadPackageDetailsFailed'))
    } finally {
      setDetailsLoading(false)
    }
  }, [])

  const clearDetails = useCallback(() => {
    setPackageDetails(null)
    setDetailsError(null)
  }, [])

  return {
    packages,
    loading,
    error,
    refetch: loadPackages,
    packageDetails,
    detailsLoading,
    detailsError,
    fetchPackageDetails,
    clearDetails,
  }
}
