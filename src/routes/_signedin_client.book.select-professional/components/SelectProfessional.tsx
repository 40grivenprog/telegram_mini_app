import React from 'react'
import { useTranslation } from 'react-i18next'
import { useProfessionals } from '../hooks/useProfessionals'
import './SelectProfessional.css'

interface SelectProfessionalProps {
  clientID: string
  onSelect: (professionalID: string, professionalName: string) => void
  onCancel: () => void
}

export default function SelectProfessional({ clientID, onSelect, onCancel }: SelectProfessionalProps) {
  const { t } = useTranslation()
  const { professionals, loading, error, pagination, page, setPage, refetch } = useProfessionals(15)

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
                    👨‍💼 {prof.first_name} {prof.last_name}
                  </div>
                </div>
              ))}
            </div>
            {pagination && (
              <div className="pagination">
                <button
                  className="btn btn-secondary"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  {t('client.book.selectProfessional.previous')}
                </button>
                <span className="page-info">
                  {t('client.book.selectProfessional.page')} {pagination.page}
                </span>
                <button
                  className="btn btn-secondary"
                  disabled={!pagination.has_next_page}
                  onClick={() => setPage(page + 1)}
                >
                  {t('client.book.selectProfessional.next')}
                </button>
              </div>
            )}
            <button className="btn btn-secondary" onClick={onCancel}>
              {t('common.cancel')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
