import { useState, useCallback } from 'react'
import { apiService } from '../../../services/api'
import i18n from '../../../i18n/config.js'

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
      console.log("ERROR", err)
      // Handle conflict error (409) - appointment time conflict
      if (err.status === 409 && err.data?.message) {
        setError(i18n.t('error.appointmentTimeConflict'))
      } else {
        setError(err.message || i18n.t('error.confirmAppointmentFailed'))
      }
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
