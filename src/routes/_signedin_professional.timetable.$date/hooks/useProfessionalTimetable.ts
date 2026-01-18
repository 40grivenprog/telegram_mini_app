import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../../../services/api'

export interface TimetableAppointment {
  id: string
  start_time: string
  end_time: string
  description: string
}

export interface GetProfessionalTimetableResponse {
  date: string
  appointments: TimetableAppointment[]
}

interface UseProfessionalTimetableResult {
  timetable: GetProfessionalTimetableResponse | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useProfessionalTimetable(professionalID: string, date: string): UseProfessionalTimetableResult {
  const [timetable, setTimetable] = useState<GetProfessionalTimetableResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTimetable = useCallback(async () => {
    if (!professionalID || !date) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await apiService.getProfessionalTimetable(date) as GetProfessionalTimetableResponse
      setTimetable(data)
    } catch (err: any) {
      setError(err.message || 'Не удалось загрузить расписание')
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
