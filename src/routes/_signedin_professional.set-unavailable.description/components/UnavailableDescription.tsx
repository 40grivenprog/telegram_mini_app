import React, { useState } from 'react'
import { useCreateUnavailableAppointment } from '../hooks/useCreateUnavailableAppointment'
import './UnavailableDescription.css'

interface UnavailableDescriptionProps {
  professionalID: string
  date: string
  startTime: string
  endTime: string
  onConfirm: () => void
  onCancel: () => void
}

export default function UnavailableDescription({
  professionalID,
  date,
  startTime,
  endTime,
  onConfirm,
  onCancel,
}: UnavailableDescriptionProps) {
  const [description, setDescription] = useState('')
  const { createUnavailableAppointment, creating, error } = useCreateUnavailableAppointment()

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr)
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return timeStr
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!description.trim()) {
      const tg = window.Telegram?.WebApp
      if (tg) {
        tg.showAlert('Пожалуйста, введите описание')
      }
      return
    }

    try {
      await createUnavailableAppointment({
        professional_id: professionalID,
        start_at: startTime,
        end_at: endTime,
        description: description.trim(),
      }, onConfirm)
    } catch {
      // Error is already handled by the hook
    }
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Введите описание</h1>
      </header>
      <div className="content">
        {error && <div className="error-message">{error}</div>}
        
        <div className="unavailable-summary">
          <p><strong>📅 Дата:</strong> {new Date(date).toLocaleDateString('ru-RU')}</p>
          <p><strong>🕐 Время:</strong> {formatTime(startTime)} - {formatTime(endTime)}</p>
        </div>

        <form onSubmit={handleSubmit} className="description-form">
          <label htmlFor="description" className="form-label">
            Описание недоступного периода
          </label>
          <textarea
            id="description"
            className="description-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Например: 'Lunch time', 'Personal break', 'Out of office'..."
            rows={4}
            disabled={creating}
            required
          />
          
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={creating || !description.trim()}
            >
              {creating ? 'Создание...' : 'Создать'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={creating}
            >
              Назад
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
