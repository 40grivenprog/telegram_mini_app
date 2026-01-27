import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { apiService } from '../../../services/api'
import './ClientRegistration.css'

interface ClientRegistrationProps {
  chatID: number
  onSuccess: (clientData: any) => void
  onCancel: () => void
}

export default function ClientRegistration({ chatID, onSuccess, onCancel }: ClientRegistrationProps) {
  const { t, i18n } = useTranslation()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!firstName.trim() || !lastName.trim()) {
      setError(t('client.registration.error.requiredFields'))
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
        locale: i18n.language || 'en',
      }

      const response = await apiService.registerClient(clientData)
      onSuccess(response)
    } catch (err) {
      setError(t('client.registration.error.registrationFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <header className="header">
        <h1>{t('client.registration.title')}</h1>
      </header>
      <div className="content">
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <label>{t('client.registration.firstName')} *</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              placeholder={t('client.registration.firstName')}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>{t('client.registration.lastName')} *</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              placeholder={t('client.registration.lastName')}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>{t('client.registration.phone')}</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder={t('client.registration.phone')}
              disabled={loading}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? t('client.registration.registering') : t('client.registration.register')}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              {t('common.back')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
