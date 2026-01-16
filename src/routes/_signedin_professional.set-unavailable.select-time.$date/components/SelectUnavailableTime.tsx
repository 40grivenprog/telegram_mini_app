import React, { useState } from 'react'
import { useProfessionalAvailability } from '../hooks/useProfessionalAvailability'
import './SelectUnavailableTime.css'

interface SelectUnavailableTimeProps {
  professionalID: string
  date: string
  onSelect: (startTime: string, endTime: string) => void
  onCancel: () => void
}

export default function SelectUnavailableTime({
  professionalID,
  date,
  onSelect,
  onCancel,
}: SelectUnavailableTimeProps) {
  // Load availability once - optimization!
  const { availableSlots, loading, error, refetch } = useProfessionalAvailability(professionalID, date)
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null)

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr)
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return timeStr
    }
  }

  const parseTime = (timeStr: string): number => {
    try {
      const date = new Date(timeStr)
      return date.getTime()
    } catch {
      return 0
    }
  }

  // Filter available end times - only after selected start time
  const getAvailableEndTimes = () => {
    if (!selectedStartTime) return []
    const startTime = parseTime(selectedStartTime)
    
    return availableSlots.filter((slot) => {
      const slotStart = parseTime(slot.start_time)
      const slotEnd = parseTime(slot.end_time)
      // End time slots that start after the selected start time
      return slotStart >= startTime && slot.available
    })
  }

  const handleStartTimeSelect = (startTime: string) => {
    setSelectedStartTime(startTime)
  }

  const handleEndTimeSelect = (endTime: string) => {
    if (!selectedStartTime) return
    
    // Find the slot that contains this end time
    const endSlot = availableSlots.find((slot) => slot.end_time === endTime && slot.available)
    if (endSlot) {
      onSelect(selectedStartTime, endTime)
    }
  }

  const handleBackToStart = () => {
    setSelectedStartTime(null)
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading-screen">
          <div className="loading">Загрузка доступного времени...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-screen">
          <div className="error-message">{error}</div>
          <button className="btn btn-primary" onClick={refetch}>
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  const availableEndTimes = getAvailableEndTimes()

  return (
    <div className="container">
      <header className="header">
        <h1>{selectedStartTime ? 'Выберите конечное время' : 'Выберите начальное время'}</h1>
        <p className="subtitle">
          Дата: {new Date(date).toLocaleDateString('ru-RU')}
          {selectedStartTime && (
            <>
              <br />
              Начальное время: {formatTime(selectedStartTime)}
            </>
          )}
        </p>
      </header>
      <div className="content">
        {!selectedStartTime ? (
          // Step 1: Select start time
          <>
            {availableSlots.length === 0 ? (
              <div className="no-slots">
                <p>Нет доступного времени на эту дату</p>
                <button className="btn btn-secondary" onClick={onCancel}>
                  Назад
                </button>
              </div>
            ) : (
              <>
                <div className="time-slots">
                  {availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      className="time-slot-button"
                      onClick={() => handleStartTimeSelect(slot.start_time)}
                    >
                      {formatTime(slot.start_time)}
                    </button>
                  ))}
                </div>
                <button className="btn btn-secondary" onClick={onCancel}>
                  Отмена
                </button>
              </>
            )}
          </>
        ) : (
          // Step 2: Select end time
          <>
            {availableEndTimes.length === 0 ? (
              <div className="no-slots">
                <p>Нет доступного времени для выбора конечного времени</p>
                <button className="btn btn-secondary" onClick={handleBackToStart}>
                  Назад к выбору начального времени
                </button>
              </div>
            ) : (
              <>
                <div className="time-slots">
                  {availableEndTimes.map((slot, index) => (
                    <button
                      key={index}
                      className="time-slot-button"
                      onClick={() => handleEndTimeSelect(slot.end_time)}
                    >
                      {formatTime(slot.end_time)}
                    </button>
                  ))}
                </div>
                <button className="btn btn-secondary" onClick={handleBackToStart}>
                  Назад к выбору начального времени
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
