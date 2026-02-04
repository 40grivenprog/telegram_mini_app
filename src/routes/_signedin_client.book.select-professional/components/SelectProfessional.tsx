import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSubscribedProfessionals } from '../hooks/useSubscribedProfessionals'
import './SelectProfessional.css'

interface SelectProfessionalProps {
  clientID: string
  onSelect: (professionalID: string, professionalName: string) => void
  onCancel: () => void
}

export default function SelectProfessional({ clientID, onSelect, onCancel }: SelectProfessionalProps) {
  const { t } = useTranslation()
  const { professionals, loading, error, refetch } = useSubscribedProfessionals()

  if (loading) {
    return (
      <div className="container">
        <div className="loading-screen">
          <div className="loading">{t('client.book.selectProfessional.loading')}</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-screen">
          <div className="error-message">{error}</div>
          <button className="btn btn-primary" onClick={refetch}>
            {t('client.book.selectProfessional.tryAgain')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <header className="header">
        <h1>{t('client.book.selectProfessional.title')}</h1>
      </header>
      <div className="content">
        {professionals.length === 0 ? (
          <div className="no-professionals">
            <p>{t('client.book.selectProfessional.noProfessionals')}</p>
            <button className="btn btn-secondary" onClick={onCancel}>
              {t('common.back')}
            </button>
          </div>
        ) : (
          <>
            <div className="professionals-list">
              {professionals.map((prof) => (
                <div
                  key={prof.id}
                  className="professional-card"
                  onClick={() => onSelect(prof.id, `${prof.first_name} ${prof.last_name}`)}
                >
                  <div className="professional-name">
                    ⭐ 👨‍💼 {prof.first_name} {prof.last_name}
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-secondary" onClick={onCancel}>
              {t('common.cancel')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
