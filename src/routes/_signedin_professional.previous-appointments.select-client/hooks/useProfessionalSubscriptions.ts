import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../../../services/api'
import i18n from '../../../i18n/config.js'

export interface ProfessionalSubscription {
  id: string
  first_name: string
  last_name: string
  chat_id: number | null
  locale: string
}

interface GetProfessionalSubscriptionsResponse {
  subscriptions: ProfessionalSubscription[]
}

interface UseProfessionalSubscriptionsResult {
  subscriptions: ProfessionalSubscription[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useProfessionalSubscriptions(): UseProfessionalSubscriptionsResult {
  const [subscriptions, setSubscriptions] = useState<ProfessionalSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiService.getProfessionalSubscriptions() as GetProfessionalSubscriptionsResponse
      setSubscriptions(response.subscriptions || [])
    } catch (err: any) {
      setError(err.message || 'Failed to load subscriptions')
      setSubscriptions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubscriptions()
  }, [fetchSubscriptions])

  return {
    subscriptions,
    loading,
    error,
    refetch: fetchSubscriptions,
  }
}
