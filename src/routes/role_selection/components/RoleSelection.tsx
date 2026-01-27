import React from 'react'
import { useTranslation } from 'react-i18next'
import LanguageSelector from '../../../components/LanguageSelector'
import './RoleSelection.css'

interface RoleSelectionProps {
  onSelectRole: (role: 'client' | 'professional') => void
}

export default function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  const { t } = useTranslation()

  return (
    <div className="container">
      <LanguageSelector />
      <header className="header">
        <h1>👋 {t('roleSelection.title')}</h1>
        <p className="subtitle">{t('roleSelection.subtitle')}</p>
      </header>
      <div className="content">
        <div className="role-selection">
          <button
            type="button"
            className="btn btn-primary btn-large"
            onClick={() => onSelectRole('client')}
          >
            👤 {t('roleSelection.client')}
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-large"
            onClick={() => onSelectRole('professional')}
          >
            👨‍💼 {t('roleSelection.professional')}
          </button>
        </div>
      </div>
    </div>
  )
}
