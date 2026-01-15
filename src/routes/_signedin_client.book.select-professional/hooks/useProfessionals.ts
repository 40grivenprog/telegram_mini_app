import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../../../services/api'

export interface GetProfessionalsResponseItem {
  id: string
  first_name: string
  last_name: string
}

export interface PaginationResponse {
  has_next_page: boolean
  page: number
  page_size: number
}

export interface GetProfessionalsResponse {
  professionals: GetProfessionalsResponseItem[]
  pagination: PaginationResponse
}

interface UseProfessionalsResult {
  professionals: GetProfessionalsResponseItem[]
  loading: boolean
  error: string | null
  pagination: PaginationResponse | null
  page: number
  setPage: (page: number) => void
  refetch: () => void
}

export function useProfessionals(pageSize: number = 15): UseProfessionalsResult {
  const [professionals, setProfessionals] = useState<GetProfessionalsResponseItem[]>([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProfessionals = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiService.getProfessionals(page, pageSize) as GetProfessionalsResponse
      setProfessionals(data.professionals || [])
      setPagination(data.pagination)
    } catch (err) {
      setError('Не удалось загрузить список профессионалов')
      setProfessionals([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize])

  useEffect(() => {
    loadProfessionals()
  }, [loadProfessionals])

  return {
    professionals,
    loading,
    error,
    pagination,
    page,
    setPage,
    refetch: loadProfessionals,
  }
}
