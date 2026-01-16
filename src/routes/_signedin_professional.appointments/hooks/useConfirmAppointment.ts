import { useState, useCallback } from 'react'
import { apiService } from '../../../services/api'

interface UseConfirmAppointmentResult {
  confirmAppointment: (appointmentID: string) => Promise<void>
  confirming: boolean
  error: string | null
}

export function useConfirmAppointment(): UseConfirmAppointmentResult {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const confirmAppointment = useCallback(async (appointmentID: string) => {
    setConfirming(true)
    setError(null)

    try {
      await apiService.confirmProfessionalAppointment(appointmentID)

      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.HapticFeedback.notificationOccurred('success')
      }
    } catch (err: any) {
      setError(err.message || 'Не удалось подтвердить бронирование')
      throw err
    } finally {
      setConfirming(false)
    }
  }, [])

  return {
    confirmAppointment,
    confirming,
    error,
  }
}
