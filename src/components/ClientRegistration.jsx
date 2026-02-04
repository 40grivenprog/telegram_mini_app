import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './ClientRegistration.css'

function ClientRegistration({ chatID, onSuccess, onCancel }) {
  const { t, i18n } = useTranslation()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!firstName.trim() || !lastName.trim()) {
      setError(t('client.registration.error.requiredFields'))
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { apiService } = await import('../services/api')
      const clientData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        chat_id: chatID,
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
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ClientRegistration
