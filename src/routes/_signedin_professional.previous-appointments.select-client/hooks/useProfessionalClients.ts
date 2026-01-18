import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../../../services/api'

export interface ProfessionalClient {
  id: string
  first_name: string
  last_name: string
}

export interface GetProfessionalClientsResponse {
  clients: ProfessionalClient[]
}

interface UseProfessionalClientsResult {
  clients: ProfessionalClient[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useProfessionalClients(professionalID: string): UseProfessionalClientsResult {
  const [clients, setClients] = useState<ProfessionalClient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadClients = useCallback(async () => {
    if (!professionalID) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await apiService.getProfessionalClients(professionalID) as GetProfessionalClientsResponse
      setClients(data.clients || [])
    } catch (err: any) {
      setError(err.message || 'Не удалось загрузить список клиентов')
      setClients([])
    } finally {
      setLoading(false)
    }
  }, [professionalID])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  return {
    clients,
    loading,
    error,
    refetch: loadClients,
  }
}
