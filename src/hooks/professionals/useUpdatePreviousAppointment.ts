import { useState, useCallback } from 'react'
import { apiService } from '../../services/api'
import i18n from '../../i18n/config.js'

export interface UpdatePreviousAppointmentInput {
  type: string
  clients_added: string[]
  clients_removed: string[]
}

interface UseUpdatePreviousAppointmentResult {
  updatePreviousAppointment: (appointmentID: string, data: UpdatePreviousAppointmentInput) => Promise<void>
  updating: boolean
  error: string | null
}

export function useUpdatePreviousAppointment(): UseUpdatePreviousAppointmentResult {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updatePreviousAppointment = useCallback(async (appointmentID: string, data: UpdatePreviousAppointmentInput) => {
    setUpdating(true)
    setError(null)

    try {
      await apiService.updatePreviousAppointment(appointmentID, data)

      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.HapticFeedback.notificationOccurred('success')
      }
    } catch (err: any) {
      setError(err.message || i18n.t('error.updatePreviousAppointmentFailed'))
      throw err
    } finally {
      setUpdating(false)
    }
  }, [])

  return {
    updatePreviousAppointment,
    updating,
    error,
  }
}
