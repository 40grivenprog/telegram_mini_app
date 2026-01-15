import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../../../services/api'

export interface ProfessionalAppointmentClient {
  id: string
  first_name: string
  last_name: string
  phone_number?: string
}

export interface ProfessionalAppointment {
  id: string
  type: string
  start_time: string
  end_time: string
  status: string
  description?: string
  created_at: string
  updated_at: string
  client?: ProfessionalAppointmentClient
}

export interface GetProfessionalAppointmentsResponse {
  appointments: ProfessionalAppointment[]
}

interface UseProfessionalAppointmentsResult {
  appointments: ProfessionalAppointment[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useProfessionalAppointments(status: string = ''): UseProfessionalAppointmentsResult {
  const [appointments, setAppointments] = useState<ProfessionalAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAppointments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiService.getProfessionalAppointments(status) as GetProfessionalAppointmentsResponse
      setAppointments(data.appointments || [])
    } catch (err: any) {
      setError(err.message || 'Не удалось загрузить бронирования')
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [status])

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
