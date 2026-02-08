import { useState, useCallback, useEffect } from 'react'
import { apiService } from '../../services/api'
import i18n from '../../i18n/config.js'

export interface PackageListItem {
  id: string
  first_name: string
  last_name: string
  issued_at: string
  expires_at: string
  apppointments_number: number
}

export interface PackageDetailsAppointment {
  id: string
  start_time: string
  end_time: string
  type: string
}

export interface PackageDetails {
  id: string
  client_id: string
  professional_id: string
  issued_at: string
  expires_at: string
  apppointments_number: number
  appointments: PackageDetailsAppointment[]
}

interface CreatePackageData {
  client: {
    id: string
    chat_id: number
    locale: string
  }
  professional_id: string
  issued_at: string
  expires_at: string
  apppointments_number: number
}

interface UsePackagesResult {
  packages: PackageListItem[]
  loading: boolean
  error: string | null
  refetch: () => void
  createPackage: (data: CreatePackageData) => Promise<{ success: boolean; error?: string }>
  packageDetails: PackageDetails | null
  detailsLoading: boolean
  detailsError: string | null
  fetchPackageDetails: (packageId: string) => Promise<void>
  clearDetails: () => void
}

export function usePackages(): UsePackagesResult {
  const [packages, setPackages] = useState<PackageListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [packageDetails, setPackageDetails] = useState<PackageDetails | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState<string | null>(null)

  const loadPackages = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiService.getPackages() as { packages: PackageListItem[] }
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

  const createPackage = useCallback(async (data: CreatePackageData): Promise<{ success: boolean; error?: string }> => {
    try {
      await apiService.createPackage(data)
      await loadPackages()
      return { success: true }
    } catch (err: any) {
      const errorMessage = err.data?.message || err.message || i18n.t('error.createPackageFailed')
      return { success: false, error: errorMessage }
    }
  }, [loadPackages])

  const fetchPackageDetails = useCallback(async (packageId: string) => {
    setDetailsLoading(true)
    setDetailsError(null)
    try {
      const data = await apiService.getPackageDetails(packageId) as PackageDetails
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
    createPackage,
    packageDetails,
    detailsLoading,
    detailsError,
    fetchPackageDetails,
    clearDetails,
  }
}
