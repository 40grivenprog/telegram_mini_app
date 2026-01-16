import { useState, useCallback } from 'react'
import { apiService } from '../../../services/api'

interface UseCancelProfessionalAppointmentResult {
  cancelAppointment: (appointmentID: string, cancellationReason: string) => Promise<void>
  canceling: boolean
  error: string | null
}

export function useCancelProfessionalAppointment(): UseCancelProfessionalAppointmentResult {
  const [canceling, setCanceling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cancelAppointment = useCallback(async (appointmentID: string, cancellationReason: string) => {
    setCanceling(true)
    setError(null)

    try {
      await apiService.cancelProfessionalAppointment(appointmentID, cancellationReason)

      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.HapticFeedback.notificationOccurred('success')
      }
    } catch (err: any) {
      setError(err.message || 'Не удалось отменить бронирование')
      throw err
    } finally {
      setCanceling(false)
    }
  }, [])

  return {
    cancelAppointment,
    canceling,
    error,
  }
}
