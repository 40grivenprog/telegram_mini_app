import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../../../services/api'
import i18n from '../../../i18n/config.js'

export interface PreviousAppointment {
  id: string
  start_time: string
  end_time: string
  description: string
}

export interface GetPreviousAppointmentsByClientResponse {
  appointments: PreviousAppointment[]
}

interface UsePreviousAppointmentsByClientResult {
  appointments: PreviousAppointment[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function usePreviousAppointmentsByClient(
  professionalID: string,
  clientID: string,
  month: string // Format: YYYY-MM
): UsePreviousAppointmentsByClientResult {
  const [appointments, setAppointments] = useState<PreviousAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAppointments = useCallback(async () => {
    if (!professionalID || !clientID || !month) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await apiService.getPreviousAppointmentsByClient(professionalID, clientID, month) as GetPreviousAppointmentsByClientResponse
      setAppointments(data.appointments || [])
    } catch (err: any) {
      setError(err.message || i18n.t('error.loadAppointmentsFailed'))
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [professionalID, clientID, month])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  return {
    appointments,
    loading,
    error,
    refetch: loadAppointments,
  }
}
