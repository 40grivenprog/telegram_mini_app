import { useState, useCallback } from 'react'
import { apiService } from '../../../services/api'

export interface CreateAppointmentRequest {
  professional_id: string
  start_time: string
  end_time: string
}

interface UseCreateAppointmentResult {
  createAppointment: (data: CreateAppointmentRequest, onSuccess?: () => void) => Promise<void>
  creating: boolean
  error: string | null
}

export function useCreateAppointment(): UseCreateAppointmentResult {
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createAppointment = useCallback(async (
    data: CreateAppointmentRequest,
    onSuccess?: () => void
  ) => {
    setCreating(true)
    setError(null)

    try {
      await apiService.createAppointment(data)

      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.HapticFeedback.notificationOccurred('success')
      }

      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Не удалось создать бронирование')
      throw err
    } finally {
      setCreating(false)
    }
  }, [])

  return {
    createAppointment,
    creating,
    error,
  }
}
