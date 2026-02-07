import { useState, useCallback } from 'react'
import { apiService } from '../../services/api'
import i18n from '../../i18n/config.js'

export interface MissingInviteUser {
  id: string
  first_name: string
  last_name: string
  chat_id: number
  locale: string
}

interface UseMissingInviteUsersResult {
  getMissingInviteUsers: (appointmentID: string) => Promise<MissingInviteUser[]>
  loading: boolean
  error: string | null
}

export function useMissingInviteUsers(): UseMissingInviteUsersResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getMissingInviteUsers = useCallback(async (appointmentID: string): Promise<MissingInviteUser[]> => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiService.getMissingInviteUsers(appointmentID) as { missing_invite_users: MissingInviteUser[] }
      return response.missing_invite_users || []
    } catch (err: any) {
      setError(err.message || i18n.t('error.loadMissingInviteUsersFailed'))
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    getMissingInviteUsers,
    loading,
    error,
  }
}
