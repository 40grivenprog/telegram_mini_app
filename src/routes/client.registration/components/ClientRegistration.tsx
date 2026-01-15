import React, { useState } from 'react'
import { apiService } from '../../../services/api'
import './ClientRegistration.css'

interface ClientRegistrationProps {
  chatID: number
  onSuccess: (clientData: any) => void
  onCancel: () => void
}

export default function ClientRegistration({ chatID, onSuccess, onCancel }: ClientRegistrationProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!firstName.trim() || !lastName.trim()) {
      setError('Пожалуйста, заполните все обязательные поля')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const clientData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        chat_id: chatID,
        phone_number: phoneNumber.trim() || null,
      }

      const response = await apiService.registerClient(clientData)
      onSuccess(response)
    } catch (err) {
      setError('Ошибка при регистрации. Попробуйте снова.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Регистрация клиента</h1>
      </header>
      <div className="content">
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <label>Имя *</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              placeholder="Введите ваше имя"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Фамилия *</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              placeholder="Введите вашу фамилию"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Телефон (необязательно)</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+7 (999) 123-45-67"
              disabled={loading}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Назад
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
