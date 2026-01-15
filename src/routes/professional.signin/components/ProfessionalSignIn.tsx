import React, { useState } from 'react'
import { apiService } from '../../../services/api'
import './ProfessionalSignIn.css'

interface ProfessionalSignInProps {
  chatID: number
  onSuccess: (userData: any) => void
  onCancel: () => void
}

export default function ProfessionalSignIn({ chatID, onSuccess, onCancel }: ProfessionalSignInProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim() || !password.trim()) {
      setError('Пожалуйста, заполните все поля')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const professionalData = {
        username: username.trim(),
        password: password.trim(),
        chat_id: chatID,
      }

      const response = await apiService.signInProfessional(professionalData)
      onSuccess(response.user)
    } catch (err) {
      setError('Ошибка при входе. Проверьте логин и пароль.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Вход для профессионала</h1>
      </header>
      <div className="content">
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <label>Имя пользователя *</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Введите имя пользователя"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Пароль *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Введите пароль"
              disabled={loading}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Вход...' : 'Войти'}
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
