import { useTranslation } from 'react-i18next'
import './RoleSelection.css'

function RoleSelection({ onSelectRole }) {
  const { t } = useTranslation()
  
  return (
    <div className="container">
      <header className="header">
        <h1>👋 {t('roleSelection.title')}</h1>
      </header>
      <div className="content">
        <div className="role-selection">
          <button
            className="btn btn-primary btn-large"
            onClick={() => onSelectRole('client')}
          >
            👤 {t('roleSelection.client')}
          </button>
          <button
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

export default RoleSelection
