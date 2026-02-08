import { useState, useCallback, useEffect } from 'react'
import { apiService } from '../../services/api'
import i18n from '../../i18n/config.js'

export interface TimetableAppointment {
  id: string
  start_time: string
  end_time: string
  type: string
  description: string
  clients: string[]
}

export interface GetProfessionalsTimetableResponse {
  date: string
  appointments: TimetableAppointment[]
}

interface UseProfessionalsTimetableResult {
  timetable: GetProfessionalsTimetableResponse | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useProfessionalsTimetable(professionalID: string, date: string): UseProfessionalsTimetableResult {
  const [timetable, setTimetable] = useState<GetProfessionalsTimetableResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTimetable = useCallback(async () => {
    if (!professionalID || !date) return

    setLoading(true)
    setError(null)

    try {
      const data = await apiService.getProfessionalsTimetable(professionalID, date) as GetProfessionalsTimetableResponse
      setTimetable(data)
    } catch (err: any) {
      setError(err.message || i18n.t('error.loadTimetableFailed'))
      setTimetable(null)
    } finally {
      setLoading(false)
    }
  }, [professionalID, date])

  useEffect(() => {
    loadTimetable()
  }, [loadTimetable])

  return {
    timetable,
    loading,
    error,
    refetch: loadTimetable,
  }
}
