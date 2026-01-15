import { useState, useCallback } from 'react'
import { apiService } from '../../../services/api'

interface CancelAppointmentResponse {
  appointment: {
    start_time: string
    end_time: string
    description?: string
    cancellation_reason: string
  }
  client: {
    first_name: string
    last_name: string
  }
  professional: {
    chat_id?: number
  }
}

interface UseCancelAppointmentResult {
  cancelAppointment: (appointmentID: string, cancellationReason: string) => Promise<void>
  canceling: boolean
  error: string | null
}

export function useCancelAppointment(): UseCancelAppointmentResult {
  const [canceling, setCanceling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cancelAppointment = useCallback(async (appointmentID: string, cancellationReason: string) => {
    setCanceling(true)
    setError(null)

    try {
      const cancelResponse = await apiService.cancelClientAppointment(appointmentID, cancellationReason) as CancelAppointmentResponse

      // Send notification to professional if chat_id is available
      if (cancelResponse?.professional?.chat_id) {
        try {
          await apiService.sendAppointmentCancellationNotification({
            chat_id: cancelResponse.professional.chat_id,
            start_time: cancelResponse.appointment.start_time,
            end_time: cancelResponse.appointment.end_time,
            first_name: cancelResponse.client.first_name,
            last_name: cancelResponse.client.last_name,
            cancellation_reason: cancelResponse.appointment.cancellation_reason,
          })
        } catch (notifErr: any) {
          console.error('Failed to send cancellation notification:', notifErr)
        }
      }

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
