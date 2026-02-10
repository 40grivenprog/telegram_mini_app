import React from 'react'
import { useTranslation } from 'react-i18next'
import { User, Briefcase } from 'lucide-react'
import LanguageSelector from '../../../components/LanguageSelector'
import './RoleSelection.css'

interface RoleSelectionProps {
  onSelectRole: (role: 'client' | 'professional') => void
}

export default function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  const { t } = useTranslation()

  return (
    <div className="role-selection-container">
      <div className="role-selection-wrapper">
        <LanguageSelector />
        <header className="role-selection-header">
          <h1>{t('roleSelection.title')}</h1>
          <p className="role-selection-subtitle">{t('roleSelection.subtitle')}</p>
        </header>
        <div className="role-selection-content">
          <div className="role-selection-actions">
            <button
              type="button"
              className="btn-role btn-role-primary"
              onClick={() => onSelectRole('client')}
            >
              <User size={22} />
              {t('roleSelection.client')}
            </button>
            <button
              type="button"
              className="btn-role btn-role-secondary"
              onClick={() => onSelectRole('professional')}
            >
              <Briefcase size={22} />
              {t('roleSelection.professional')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
