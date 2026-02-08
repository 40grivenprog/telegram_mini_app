import { useState, useCallback } from 'react'
import { apiService } from '../../services/api'
import i18n from '../../i18n/config.js'

export interface PendingInviteUser {
  id: string
  first_name: string
  last_name: string
}

interface UsePendingInviteUsersResult {
  getPendingInviteUsers: (appointmentID: string) => Promise<PendingInviteUser[]>
  loading: boolean
  error: string | null
}

export function usePendingInviteUsers(): UsePendingInviteUsersResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getPendingInviteUsers = useCallback(async (appointmentID: string): Promise<PendingInviteUser[]> => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiService.getPendingInviteUsers(appointmentID) as { pending_invite_users: PendingInviteUser[] }
      return response.pending_invite_users || []
    } catch (err: any) {
      setError(err.message || i18n.t('error.loadPendingInviteUsersFailed'))
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    getPendingInviteUsers,
    loading,
    error,
  }
}
