import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../../../services/api'
import i18n from '../../../i18n/config.js'

export interface ClientInvite {
  id: string
  appointment_id: string
  start_time: string
  end_time: string
  description: string
  type: string
  professional_name: string
  client_id: string
}

interface GetClientInvitesResponse {
  invites: ClientInvite[]
}

export function useClientInvites() {
  const [invites, setInvites] = useState<ClientInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadInvites = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('useClientInvites: calling apiService.getClientInvites()')
      const data = await apiService.getClientInvites() as GetClientInvitesResponse
      console.log('useClientInvites: received data', data)
      setInvites(data.invites || [])
    } catch (err: any) {
      console.error('useClientInvites: error', err)
      setError(err.message || i18n.t('error.loadInvitesFailed'))
      setInvites([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInvites()
  }, [loadInvites])

  return {
    invites,
    loading,
    error,
    refetch: loadInvites,
  }
}
