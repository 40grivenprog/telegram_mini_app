import { useState, useCallback } from 'react'
import { apiService } from '../../../services/api'
import i18n from '../../../i18n/config.js'

export interface AppointmentDetailsClient {
  id: string
  first_name: string
  last_name: string
}

export interface AppointmentDetails {
  id: string
  start_time: string
  end_time: string
  description: string
  type: string
  clients: AppointmentDetailsClient[]
}

interface UseAppointmentDetailsResult {
  getAppointmentDetails: (appointmentID: string) => Promise<AppointmentDetails | null>
  loading: boolean
  error: string | null
}

export function useAppointmentDetails(): UseAppointmentDetailsResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getAppointmentDetails = useCallback(async (appointmentID: string): Promise<AppointmentDetails | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiService.getAppointmentDetails(appointmentID) as AppointmentDetails
      return response
    } catch (err: any) {
      setError(err.message || i18n.t('error.loadAppointmentsFailed'))
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    getAppointmentDetails,
    loading,
    error,
  }
}
