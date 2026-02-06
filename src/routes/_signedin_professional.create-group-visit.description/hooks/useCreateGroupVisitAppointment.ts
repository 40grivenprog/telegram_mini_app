import { useState, useCallback } from 'react'
import { apiService } from '../../../services/api'
import i18n from '../../../i18n/config.js'

export interface CreateGroupVisitAppointmentClient {
  id: string
  chat_id: number
  locale: string
}

export interface CreateGroupVisitAppointmentRequest {
  professional_id: string
  start_at: string
  end_at: string
  description: string
  type: 'split' | 'group'
  clients_selected: 'all' | 'partially_selected'
  clients: CreateGroupVisitAppointmentClient[]
}

interface UseCreateGroupVisitAppointmentResult {
  createGroupVisitAppointment: (data: CreateGroupVisitAppointmentRequest, onSuccess?: () => void) => Promise<void>
  creating: boolean
  error: string | null
}

export function useCreateGroupVisitAppointment(): UseCreateGroupVisitAppointmentResult {
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createGroupVisitAppointment = useCallback(async (
    data: CreateGroupVisitAppointmentRequest,
    onSuccess?: () => void
  ) => {
    setCreating(true)
    setError(null)

    try {
      await apiService.createGroupVisitAppointment({
        start_at: data.start_at,
        end_at: data.end_at,
        description: data.description,
        type: data.type,
        clients_selected: data.clients_selected,
        clients: data.clients,
      })

      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.HapticFeedback.notificationOccurred('success')
      }

      onSuccess?.()
    } catch (err: any) {
      setError(err.message || i18n.t('error.createGroupVisitFailed'))
      throw err
    } finally {
      setCreating(false)
    }
  }, [])

  return {
    createGroupVisitAppointment,
    creating,
    error,
  }
}
