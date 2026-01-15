import React from 'react'
import { useProfessionalAvailability } from '../hooks/useProfessionalAvailability'
import './SelectTime.css'

interface SelectTimeProps {
  professionalID: string
  date: string
  onSelect: (startTime: string, endTime: string) => void
  onCancel: () => void
}

export default function SelectTime({ professionalID, date, onSelect, onCancel }: SelectTimeProps) {
  const { availableSlots, loading, error, refetch } = useProfessionalAvailability(professionalID, date)

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr)
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return timeStr
    }
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

  return (
    <div className="container">
      <header className="header">
        <h1>Выберите время</h1>
        <p className="subtitle">
          Дата: {new Date(date).toLocaleDateString('ru-RU')}
        </p>
      </header>
      <div className="content">
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
                  onClick={() => onSelect(slot.start_time, slot.end_time)}
                >
                  {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                </button>
              ))}
            </div>
            <button className="btn btn-secondary" onClick={onCancel}>
              Отмена
            </button>
          </>
        )}
      </div>
    </div>
  )
}
