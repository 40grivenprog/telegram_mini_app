import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LogIn, ArrowLeft, User, Lock, Loader2 } from 'lucide-react'
import { apiService } from '../../../services/api'
import LanguageSelector from '../../../components/LanguageSelector'
import './ProfessionalSignIn.css'

interface ProfessionalSignInProps {
  chatID: number
  onSuccess: (userData: any) => void
  onCancel: () => void
}

export default function ProfessionalSignIn({ chatID, onSuccess, onCancel }: ProfessionalSignInProps) {
  const { t, i18n } = useTranslation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim() || !password.trim()) {
      setError(t('professional.signin.error.requiredFields'))
      return
    }

    setLoading(true)
    setError(null)

    try {
      const professionalData = {
        username: username.trim(),
        password: password.trim(),
        chat_id: chatID,
        locale: i18n.language || 'en',
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
    <div className="signin-container">
      <div className="signin-wrapper">
        <LanguageSelector />
        <header className="signin-header">
          <h1>{t('professional.signin.title')}</h1>
        </header>
        <div className="signin-content">
          {error && <div className="signin-error">{error}</div>}
          <form onSubmit={handleSubmit} className="signin-form">
            <div className="signin-form-group">
              <label>
                <User size={14} />
                {t('professional.signin.username')}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder={t('professional.signin.username')}
                disabled={loading}
              />
            </div>
            <div className="signin-form-group">
              <label>
                <Lock size={14} />
                {t('professional.signin.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={t('professional.signin.password')}
                disabled={loading}
              />
            </div>
            <div className="signin-form-actions">
              <button type="submit" className="signin-btn signin-btn-primary" disabled={loading}>
                {loading ? (
                  <><Loader2 size={16} className="spinner" /> {t('professional.signin.signingIn')}</>
                ) : (
                  <><LogIn size={16} /> {t('professional.signin.signin')}</>
                )}
              </button>
              <button
                type="button"
                className="signin-btn signin-btn-secondary"
                onClick={onCancel}
                disabled={loading}
              >
                <ArrowLeft size={16} />
                {t('common.back')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
