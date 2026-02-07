import { useState, useCallback } from 'react'
import { apiService } from '../../services/api'
import i18n from '../../i18n/config.js'

export interface UpdateAppointmentClient {
  id: string
  chat_id: number
  locale: string
}

export interface UpdateAppointmentInput {
  description?: string
  type?: string
  clients?: UpdateAppointmentClient[]
}

interface UseUpdateAppointmentResult {
  updateAppointment: (appointmentID: string, data: UpdateAppointmentInput) => Promise<void>
  updating: boolean
  error: string | null
}

export function useUpdateAppointment(): UseUpdateAppointmentResult {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateAppointment = useCallback(async (appointmentID: string, data: UpdateAppointmentInput) => {
    setUpdating(true)
    setError(null)

    try {
      await apiService.updateAppointment(appointmentID, data)

      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.HapticFeedback.notificationOccurred('success')
      }
    } catch (err: any) {
      setError(err.message || i18n.t('error.updateAppointmentFailed'))
      throw err
    } finally {
      setUpdating(false)
    }
  }, [])

  return {
    updateAppointment,
    updating,
    error,
  }
}
