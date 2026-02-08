import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../../../services/api'
import i18n from '../../../i18n/config.js'

export interface PreviousAppointment {
  id: string
  start_time: string
  end_time: string
  description: string
  type: string
  users_count: number
}

export interface GetPreviousAppointmentsResponse {
  appointments: PreviousAppointment[]
  pagination: {
    has_next_page: boolean
    page: number
    page_size: number
  }
}

interface UsePreviousAppointmentsResult {
  appointments: PreviousAppointment[]
  pagination: GetPreviousAppointmentsResponse['pagination'] | null
  loading: boolean
  error: string | null
  page: number
  setPage: (page: number) => void
  refetch: () => void
}

export function usePreviousAppointments(
  clientID: string | null,
  page: number = 1,
  pageSize: number = 15,
  dateFrom: string | null = null,
  dateTo: string | null = null
): UsePreviousAppointmentsResult {
  const [appointments, setAppointments] = useState<PreviousAppointment[]>([])
  const [pagination, setPagination] = useState<GetPreviousAppointmentsResponse['pagination'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(page)

  const fetchAppointments = useCallback(async (pageNum: number) => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiService.getPreviousAppointments(clientID, pageNum, pageSize, dateFrom, dateTo) as GetPreviousAppointmentsResponse
      setAppointments(response.appointments || [])
      setPagination(response.pagination || null)
    } catch (err: any) {
      setError(err.message || i18n.t('error.loadAppointmentsFailed'))
      setAppointments([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [clientID, pageSize, dateFrom, dateTo])

  useEffect(() => {
    setCurrentPage(1)
  }, [clientID, dateFrom, dateTo])

  useEffect(() => {
    fetchAppointments(currentPage)
  }, [fetchAppointments, currentPage])

  const setPage = useCallback((pageNum: number) => {
    setCurrentPage(pageNum)
  }, [])

  return {
    appointments,
    pagination,
    loading,
    error,
    page: currentPage,
    setPage,
    refetch: () => fetchAppointments(currentPage),
  }
}
