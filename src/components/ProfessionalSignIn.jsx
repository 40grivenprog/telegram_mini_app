import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './ProfessionalSignIn.css'

function ProfessionalSignIn({ chatID, onSuccess, onCancel }) {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!username.trim() || !password.trim()) {
      setError(t('professional.signin.error.requiredFields'))
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { apiService } = await import('../services/api')
      const professionalData = {
        username: username.trim(),
        password: password.trim(),
        chat_id: chatID,
      }

      const response = await apiService.signInProfessional(professionalData)
      onSuccess(response.user)
    } catch (err) {
      setError(t('professional.signin.error.signinFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <header className="header">
        <h1>{t('professional.signin.title')}</h1>
      </header>
      <div className="content">
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <label>{t('professional.signin.username')} *</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder={t('professional.signin.username')}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>{t('professional.signin.password')} *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={t('professional.signin.password')}
              disabled={loading}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? t('professional.signin.signingIn') : t('professional.signin.signin')}
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

export default ProfessionalSignIn
