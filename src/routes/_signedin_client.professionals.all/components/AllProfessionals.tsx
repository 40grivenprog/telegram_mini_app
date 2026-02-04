import React from 'react'
import { useTranslation } from 'react-i18next'
import { useProfessionals } from '../hooks/useProfessionals'
import './AllProfessionals.css'

interface AllProfessionalsProps {
  onBack: () => void
}

export default function AllProfessionals({ onBack }: AllProfessionalsProps) {
  const { t } = useTranslation()
  const { professionals, loading, error, pagination, page, setPage, refetch, subscribingIds, handleSubscribe } = useProfessionals(15)

  if (loading) {
    return (
      <div className="container">
        <div className="loading-screen">
          <div className="loading">{t('client.professionals.all.loading')}</div>
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
            {t('common.tryAgain')}
          </button>
          <button className="btn btn-secondary" onClick={onBack}>
            {t('common.back')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <header className="header">
        <h1>{t('client.professionals.all.title')}</h1>
      </header>
      <div className="content">
        {professionals.length === 0 ? (
          <div className="no-professionals">
            <p>{t('client.professionals.all.noProfessionals')}</p>
            <button className="btn btn-secondary" onClick={onBack}>
              {t('common.back')}
            </button>
          </div>
        ) : (
          <>
            <div className="professionals-list">
              {professionals.map((prof) => (
                <div key={prof.id} className="professional-card">
                  <div className="professional-info">
                    <div className="professional-name">
                      👨‍💼 {prof.first_name} {prof.last_name}
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleSubscribe(prof.id)}
                    disabled={subscribingIds.has(prof.id)}
                  >
                    {subscribingIds.has(prof.id) 
                      ? t('client.professionals.all.subscribing') 
                      : t('client.professionals.all.subscribe')}
                  </button>
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
                  {t('common.previous')}
                </button>
                <span className="page-info">
                  {t('common.page')} {pagination.page}
                </span>
                <button
                  className="btn btn-secondary"
                  disabled={!pagination.has_next_page}
                  onClick={() => setPage(page + 1)}
                >
                  {t('common.next')}
                </button>
              </div>
            )}
            <button className="btn btn-secondary" onClick={onBack}>
              {t('common.back')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
