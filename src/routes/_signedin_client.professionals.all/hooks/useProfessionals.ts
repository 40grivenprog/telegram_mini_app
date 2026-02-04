import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../../../services/api'
import i18n from '../../../i18n/config.js'

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        HapticFeedback: {
          notificationOccurred: (type: string) => void
        }
      }
    }
  }
}

export interface GetProfessionalsResponseItem {
  id: string
  first_name: string
  last_name: string
  chat_id?: number | null
  locale: string
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
  subscribingIds: Set<string>
  handleSubscribe: (professionalID: string) => Promise<void>
}

export function useProfessionals(pageSize: number = 15): UseProfessionalsResult {
  const [professionals, setProfessionals] = useState<GetProfessionalsResponseItem[]>([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subscribingIds, setSubscribingIds] = useState<Set<string>>(new Set())

  const loadProfessionals = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiService.getProfessionals(page, pageSize) as GetProfessionalsResponse
      setProfessionals(data.professionals || [])
      setPagination(data.pagination)
    } catch (err) {
      setError(i18n.t('error.loadProfessionalsFailed'))
      setProfessionals([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize])

  const handleSubscribe = useCallback(async (professionalID: string) => {
    setSubscribingIds(prev => new Set(prev).add(professionalID))
    try {
      const professional = professionals.find(p => p.id === professionalID)
      if (!professional) {
        throw new Error('Professional not found')
      }
      if (!professional.chat_id) {
        throw new Error('Professional chat_id is missing')
      }
      if (!professional.locale) {
        throw new Error('Professional locale is missing')
      }
      await apiService.subscribeToProfessional(professionalID, professional.chat_id, professional.locale)
      const tg = window.Telegram?.WebApp
      if (tg) {
        tg.HapticFeedback.notificationOccurred('success')
      }
      // Reload the list after successful subscription
      await loadProfessionals()
    } catch (err) {
      console.error('Failed to subscribe:', err)
      const tg = window.Telegram?.WebApp
      if (tg) {
        tg.HapticFeedback.notificationOccurred('error')
      }
    } finally {
      setSubscribingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(professionalID)
        return newSet
      })
    }
  }, [loadProfessionals, professionals])

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
    subscribingIds,
    handleSubscribe,
  }
}
