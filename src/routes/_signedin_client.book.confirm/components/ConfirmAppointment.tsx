import React from 'react'
import { useCreateAppointment } from '../hooks/useCreateAppointment'
import './ConfirmAppointment.css'

interface ConfirmAppointmentProps {
  clientID: string
  professionalID: string
  professionalName: string
  date: string
  startTime: string
  endTime: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmAppointment({
  clientID,
  professionalID,
  professionalName,
  date,
  startTime,
  endTime,
  onConfirm,
  onCancel
}: ConfirmAppointmentProps) {
  const { createAppointment, creating, error } = useCreateAppointment()

  const handleConfirm = async () => {
    try {
      await createAppointment({
        professional_id: professionalID,
        start_time: startTime,
        end_time: endTime,
      }, onConfirm)
    } catch {
      // Error is already handled by the hook
    }
  }

  const formatTime = (timeStr: string) => {
    try {
      // Parse RFC3339 format
      const date = new Date(timeStr)
      if (isNaN(date.getTime())) {
        return timeStr
      }
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return timeStr
    }
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Подтверждение бронирования</h1>
      </header>
      <div className="content">
        {error && <div className="error-message">{error}</div>}
        <div className="booking-summary">
          <p><strong>Профессионал:</strong> {professionalName}</p>
          <p><strong>Дата:</strong> {new Date(date).toLocaleDateString('ru-RU')}</p>
          <p><strong>Время:</strong> {formatTime(startTime)} - {formatTime(endTime)}</p>
        </div>
        <div className="confirm-actions">
          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={creating}
          >
            {creating ? 'Создание...' : 'Подтвердить'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={creating}
          >
            Назад
          </button>
        </div>
      </div>
    </div>
  )
}
