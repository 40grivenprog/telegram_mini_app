import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../../../services/api'
import i18n from '../../../i18n/config.js'

export interface AvailabilitySlot {
  start_time: string
  end_time: string
  available: boolean
}

interface UseProfessionalAvailabilityResult {
  availableSlots: AvailabilitySlot[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useProfessionalAvailability(professionalID: string, date: string): UseProfessionalAvailabilityResult {
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAvailability = useCallback(async () => {
    if (!professionalID || !date) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await apiService.getProfessionalAvailability(professionalID, date) as { slots: AvailabilitySlot[] }
      const available = data.slots?.filter((slot) => slot.available) || []
      setAvailableSlots(available)
    } catch (err: any) {
      setError(err.message || i18n.t('error.loadAvailabilityFailed'))
      setAvailableSlots([])
    } finally {
      setLoading(false)
    }
  }, [professionalID, date])

  useEffect(() => {
    loadAvailability()
  }, [loadAvailability])

  return {
    availableSlots,
    loading,
    error,
    refetch: loadAvailability,
  }
}
