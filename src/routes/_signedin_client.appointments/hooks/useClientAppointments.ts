import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../../../services/api'
import i18n from '../../../i18n/config.js'

export interface ClientAppointmentProfessional {
  first_name: string
  last_name: string
  chat_id?: number
}

export interface ClientAppointment {
  id: string
  start_time: string
  end_time: string
  description?: string
  professional?: ClientAppointmentProfessional
}

export interface PaginationResponse {
  has_next_page: boolean
  page: number
  page_size: number
}

export interface GetClientAppointmentsResponse {
  appointments: ClientAppointment[]
  pagination: PaginationResponse
}

interface UseClientAppointmentsResult {
  appointments: ClientAppointment[]
  loading: boolean
  error: string | null
  pagination: PaginationResponse | null
  page: number
  setPage: (page: number) => void
  refetch: () => void
}

export function useClientAppointments(status: string = '', pageSize: number = 15, enabled: boolean = true): UseClientAppointmentsResult {
  const [appointments, setAppointments] = useState<ClientAppointment[]>([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Reset page to 1 when status changes
  useEffect(() => {
    setPage(1)
  }, [status])

  const loadAppointments = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    try {
      const data = await apiService.getClientAppointments(status, page, pageSize) as GetClientAppointmentsResponse
      setAppointments(data.appointments || [])
      setPagination(data.pagination)
    } catch (err: any) {
      setError(err.message || i18n.t('error.loadAppointmentsFailed'))
      setAppointments([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [status, page, pageSize, enabled])

  useEffect(() => {
    if (enabled) {
      loadAppointments()
    }
  }, [loadAppointments, enabled])

  return {
    appointments,
    loading,
    error,
    pagination,
    page,
    setPage,
    refetch: loadAppointments,
  }
}
