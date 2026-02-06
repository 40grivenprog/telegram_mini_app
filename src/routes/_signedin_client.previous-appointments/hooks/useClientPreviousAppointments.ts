import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../../../services/api'
import i18n from '../../../i18n/config.js'

export interface ClientPreviousAppointment {
  id: string
  start_time: string
  end_time: string
  type: string
  first_name: string
  last_name: string
}

export interface PaginationResponse {
  has_next_page: boolean
  page: number
  page_size: number
}

export interface GetClientPreviousAppointmentsResponse {
  appointments: ClientPreviousAppointment[]
  pagination: PaginationResponse
}

interface UseClientPreviousAppointmentsResult {
  appointments: ClientPreviousAppointment[]
  loading: boolean
  error: string | null
  pagination: PaginationResponse | null
  page: number
  setPage: (page: number) => void
  refetch: () => void
}

export function useClientPreviousAppointments(pageSize: number = 15, enabled: boolean = true): UseClientPreviousAppointmentsResult {
  const [appointments, setAppointments] = useState<ClientPreviousAppointment[]>([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAppointments = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    try {
      const data = await apiService.getClientPreviousAppointments(page, pageSize) as GetClientPreviousAppointmentsResponse
      setAppointments(data.appointments || [])
      setPagination(data.pagination)
    } catch (err: any) {
      setError(err.message || i18n.t('error.loadAppointmentsFailed'))
      setAppointments([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, enabled])

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
