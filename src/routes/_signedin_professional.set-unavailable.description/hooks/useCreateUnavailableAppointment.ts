import { useState, useCallback } from 'react'
import { apiService } from '../../../services/api'

export interface CreateUnavailableAppointmentRequest {
  professional_id: string
  start_at: string
  end_at: string
  description: string
}

interface UseCreateUnavailableAppointmentResult {
  createUnavailableAppointment: (data: CreateUnavailableAppointmentRequest, onSuccess?: () => void) => Promise<void>
  creating: boolean
  error: string | null
}

export function useCreateUnavailableAppointment(): UseCreateUnavailableAppointmentResult {
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createUnavailableAppointment = useCallback(async (
    data: CreateUnavailableAppointmentRequest,
    onSuccess?: () => void
  ) => {
    setCreating(true)
    setError(null)

    try {
      await apiService.createUnavailableAppointment(data.professional_id, {
        start_at: data.start_at,
        end_at: data.end_at,
        description: data.description,
      })

      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.HapticFeedback.notificationOccurred('success')
      }

      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Не удалось создать недоступный период')
      throw err
    } finally {
      setCreating(false)
    }
  }, [])

  return {
    createUnavailableAppointment,
    creating,
    error,
  }
}
