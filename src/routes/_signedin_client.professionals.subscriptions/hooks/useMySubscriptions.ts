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

export interface SubscribedProfessional {
  id: string
  first_name: string
  last_name: string
}

export interface PaginationResponse {
  has_next_page: boolean
  page: number
  page_size: number
}

export interface GetSubscribedProfessionalsResponse {
  professionals: SubscribedProfessional[]
  pagination: PaginationResponse
}

interface UseMySubscriptionsResult {
  professionals: SubscribedProfessional[]
  loading: boolean
  error: string | null
  pagination: PaginationResponse | null
  page: number
  setPage: (page: number) => void
  unsubscribingIds: Set<string>
  handleUnsubscribe: (professionalID: string) => Promise<void>
  refetch: () => void
}

export function useMySubscriptions(pageSize: number = 15): UseMySubscriptionsResult {
  const [professionals, setProfessionals] = useState<SubscribedProfessional[]>([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unsubscribingIds, setUnsubscribingIds] = useState<Set<string>>(new Set())

  const loadSubscriptions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiService.getSubscribedProfessionals(page, pageSize) as GetSubscribedProfessionalsResponse
      setProfessionals(data.professionals || [])
      setPagination(data.pagination)
    } catch (err) {
      setError(i18n.t('client.professionals.subscriptions.error.loadFailed'))
      setProfessionals([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize])

  const handleUnsubscribe = useCallback(async (professionalID: string) => {
    setUnsubscribingIds(prev => new Set(prev).add(professionalID))
    try {
      await apiService.unsubscribeFromProfessional(professionalID)
      const tg = window.Telegram?.WebApp
      if (tg) {
        tg.HapticFeedback.notificationOccurred('success')
      }
      // Reload the list after successful unsubscribe
      await loadSubscriptions()
    } catch (err) {
      console.error('Failed to unsubscribe:', err)
      const tg = window.Telegram?.WebApp
      if (tg) {
        tg.HapticFeedback.notificationOccurred('error')
      }
    } finally {
      setUnsubscribingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(professionalID)
        return newSet
      })
    }
  }, [loadSubscriptions])

  useEffect(() => {
    loadSubscriptions()
  }, [loadSubscriptions])

  return {
    professionals,
    loading,
    error,
    pagination,
    page,
    setPage,
    unsubscribingIds,
    handleUnsubscribe,
    refetch: loadSubscriptions,
  }
}
