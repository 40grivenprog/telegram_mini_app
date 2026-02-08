import { useState, useCallback } from 'react'
import { apiService } from '../../services/api'
import i18n from '../../i18n/config.js'

export interface InviteClient {
  id: string
  chat_id: number
  locale: string
}

interface UseInviteForAppointmentResult {
  inviteForAppointment: (appointmentID: string, clients: InviteClient[]) => Promise<void>
  inviting: boolean
  error: string | null
}

export function useInviteForAppointment(): UseInviteForAppointmentResult {
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inviteForAppointment = useCallback(async (appointmentID: string, clients: InviteClient[]) => {
    setInviting(true)
    setError(null)

    try {
      await apiService.createInviteForAppointment(appointmentID, clients)

      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.HapticFeedback.notificationOccurred('success')
      }
    } catch (err: any) {
      setError(err.message || i18n.t('error.inviteForAppointmentFailed'))
      throw err
    } finally {
      setInviting(false)
    }
  }, [])

  return {
    inviteForAppointment,
    inviting,
    error,
  }
}
