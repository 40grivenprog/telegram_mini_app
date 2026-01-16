import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../../../services/api'

export interface TimeSlot {
  start_time: string
  end_time: string
  available: boolean
}

export interface GetProfessionalAvailabilityResponse {
  date: string
  slots: TimeSlot[]
}

interface UseProfessionalAvailabilityResult {
  availableSlots: TimeSlot[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useProfessionalAvailability(professionalID: string, date: string): UseProfessionalAvailabilityResult {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
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
      const data = await apiService.getProfessionalAvailability(professionalID, date) as GetProfessionalAvailabilityResponse
      const available = data.slots?.filter((slot) => slot.available) || []
      setAvailableSlots(available)
    } catch (err) {
      setError('Не удалось загрузить доступное время')
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
