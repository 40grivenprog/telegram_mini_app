import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../../../services/api'
import i18n from '../../../i18n/config.js'
import { formatDateLocal } from '../../../utils/date'

export interface AvailabilitySlot {
  start_time: string
  end_time: string
  available: boolean
}

interface UseSetUnavailableResult {
  selectedDate: string | null
  setSelectedDate: (date: string | null) => void
  availableSlots: AvailabilitySlot[]
  slotsLoading: boolean
  slotsError: string | null
  selectedStartTime: string | null
  setSelectedStartTime: (time: string | null) => void
  selectedEndTime: string | null
  setSelectedEndTime: (time: string | null) => void
  description: string
  setDescription: (desc: string) => void
  createUnavailable: (onSuccess: () => void) => Promise<void>
  creating: boolean
  error: string | null
}

export function useSetUnavailable(professionalID: string): UseSetUnavailableResult {
  const [selectedDate, setSelectedDateState] = useState<string | null>(formatDateLocal(new Date()))

  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState<string | null>(null)
  
  const [selectedStartTime, setSelectedStartTimeState] = useState<string | null>(null)
  const [selectedEndTime, setSelectedEndTimeState] = useState<string | null>(null)

  const [description, setDescription] = useState('')

  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setSelectedDate = useCallback((date: string | null) => {
    setSelectedDateState(date)
    setSelectedStartTimeState(null)
    setSelectedEndTimeState(null)
    setError(null)
  }, [])

  const setSelectedStartTime = useCallback((time: string | null) => {
    setSelectedStartTimeState(time)
    setSelectedEndTimeState(null) // Reset end time when start time changes
    setError(null)
  }, [])

  const setSelectedEndTime = useCallback((time: string | null) => {
    setSelectedEndTimeState(time)
    setError(null)
  }, [])

  // Load slots when date changes
  useEffect(() => {
    if (!professionalID || !selectedDate) {
      setAvailableSlots([])
      return
    }

    const load = async () => {
      setSlotsLoading(true)
      setSlotsError(null)
      try {
        const data = await apiService.getProfessionalAvailability(professionalID, selectedDate) as { slots: AvailabilitySlot[] }
        const available = data.slots?.filter((slot) => slot.available) || []
        setAvailableSlots(available)
      } catch (err: any) {
        setSlotsError(err.message || i18n.t('error.loadAvailabilityFailed'))
        setAvailableSlots([])
      } finally {
        setSlotsLoading(false)
      }
    }
    load()
  }, [professionalID, selectedDate])

  const createUnavailable = useCallback(async (onSuccess: () => void) => {
    if (!selectedStartTime || !selectedEndTime || !description.trim()) return

    setCreating(true)
    setError(null)

    try {
      await apiService.createUnavailableAppointment({
        start_at: selectedStartTime,
        end_at: selectedEndTime,
        description: description.trim(),
      })

      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.HapticFeedback.notificationOccurred('success')
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message || i18n.t('error.createUnavailableFailed'))
    } finally {
      setCreating(false)
    }
  }, [selectedStartTime, selectedEndTime, description])

  return {
    selectedDate,
    setSelectedDate,
    availableSlots,
    slotsLoading,
    slotsError,
    selectedStartTime,
    setSelectedStartTime,
    selectedEndTime,
    setSelectedEndTime,
    description,
    setDescription,
    createUnavailable,
    creating,
    error,
  }
}
