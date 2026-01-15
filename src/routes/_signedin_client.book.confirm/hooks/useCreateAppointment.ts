import { useState, useCallback } from 'react'
import { apiService } from '../../../services/api'

export interface CreateAppointmentRequest {
  professional_id: string
  start_time: string
  end_time: string
}

export interface AppointmentResponseItem {
  id: string
  start_time: string
  end_time: string
  description?: string
}

export interface ClientResponseItem {
  first_name: string
  last_name: string
  chat_id?: number
}

export interface ProfessionalResponseItem {
  chat_id: number
}

export interface CreateAppointmentResponse {
  appointment: AppointmentResponseItem
  client: ClientResponseItem
  professional: ProfessionalResponseItem
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
      const appointmentResponse = await apiService.createAppointment(data) as CreateAppointmentResponse

      if (appointmentResponse?.professional?.chat_id) {
        try {
          await apiService.sendAppointmentRequest({
            chat_id: appointmentResponse.professional.chat_id,
            appointment_id: appointmentResponse.appointment.id,
            client_name: `${appointmentResponse.client.first_name} ${appointmentResponse.client.last_name}`,
            start_time: appointmentResponse.appointment.start_time,
            end_time: appointmentResponse.appointment.end_time,
            description: appointmentResponse.appointment.description || 'Personal training',
          })
        } catch (notifErr: any) {
          console.error('Failed to send notification:', notifErr)
        }
      }

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
