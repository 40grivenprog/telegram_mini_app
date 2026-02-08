import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../../../services/api'
import i18n from '../../../i18n/config.js'

export interface GetProfessionalAppointmentsResponseItem {
  id: string
  start_time: string
  end_time: string
  type: string
  clients: string[]
}

export interface PaginationResponse {
  has_next_page: boolean
  page: number
  page_size: number
}

export interface GetProfessionalAppointmentsResponse {
  appointments: GetProfessionalAppointmentsResponseItem[]
  pagination: PaginationResponse
}

interface UseProfessionalAppointmentsResult {
  appointments: GetProfessionalAppointmentsResponseItem[]
  loading: boolean
  error: string | null
  pagination: PaginationResponse | null
  page: number
  setPage: (page: number) => void
  refetch: () => void
}

export function useProfessionalAppointments(status: string = '', pageSize: number = 15, enabled: boolean = true): UseProfessionalAppointmentsResult {
  const [appointments, setAppointments] = useState<GetProfessionalAppointmentsResponseItem[]>([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Reset page to 1 when status changes
  useEffect(() => {
    setPage(1)
  }, [status])

  const loadAppointments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiService.getProfessionalAppointments(status, page, pageSize) as GetProfessionalAppointmentsResponse
      setAppointments(data.appointments || [])
      console.log("data.appointments", data.appointments)
      setPagination(data.pagination)
    } catch (err: any) {
      setError(err.message || i18n.t('error.loadAppointmentsFailed'))
      setAppointments([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [status, page, pageSize])

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
