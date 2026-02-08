import { useState, useCallback } from 'react'
import { apiService } from '../../services/api'
import i18n from '../../i18n/config.js'

export interface MissingClient {
  id: string
  first_name: string
  last_name: string
  chat_id: number
  locale: string
}

interface UseMissingClientsResult {
  getMissingClients: (appointmentID: string) => Promise<MissingClient[]>
  loading: boolean
  error: string | null
}

export function useMissingClients(): UseMissingClientsResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getMissingClients = useCallback(async (appointmentID: string): Promise<MissingClient[]> => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiService.getMissingClientsForPreviousAppointment(appointmentID) as { missing_clients: MissingClient[] }
      return response.missing_clients || []
    } catch (err: any) {
      setError(err.message || i18n.t('error.loadMissingClientsFailed'))
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    getMissingClients,
    loading,
    error,
  }
}
