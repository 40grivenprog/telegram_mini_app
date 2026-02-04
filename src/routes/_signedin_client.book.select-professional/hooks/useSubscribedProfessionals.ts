import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../../../services/api'
import i18n from '../../../i18n/config.js'

export interface SubscribedProfessional {
  id: string
  first_name: string
  last_name: string
}

export interface GetSubscribedProfessionalsResponse {
  professionals: SubscribedProfessional[]
}

interface UseSubscribedProfessionalsResult {
  professionals: SubscribedProfessional[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useSubscribedProfessionals(): UseSubscribedProfessionalsResult {
  const [professionals, setProfessionals] = useState<SubscribedProfessional[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProfessionals = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiService.getSubscribedProfessionals() as GetSubscribedProfessionalsResponse
      setProfessionals(data.professionals || [])
    } catch (err) {
      setError(i18n.t('client.professionals.subscriptions.error.loadFailed'))
      setProfessionals([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfessionals()
  }, [loadProfessionals])

  return {
    professionals,
    loading,
    error,
    refetch: loadProfessionals,
  }
}
