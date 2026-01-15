import React from 'react'
import { useProfessionals } from '../hooks/useProfessionals'
import './SelectProfessional.css'

interface SelectProfessionalProps {
  clientID: string
  onSelect: (professionalID: string, professionalName: string) => void
  onCancel: () => void
}

export default function SelectProfessional({ clientID, onSelect, onCancel }: SelectProfessionalProps) {
  const { professionals, loading, error, pagination, page, setPage, refetch } = useProfessionals(15)

  if (loading) {
    return (
      <div className="container">
        <div className="loading-screen">
          <div className="loading">Загрузка профессионалов...</div>
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
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Выберите профессионала</h1>
      </header>
      <div className="content">
        {professionals.length === 0 ? (
          <div className="no-professionals">
            <p>Нет доступных профессионалов</p>
            <button className="btn btn-secondary" onClick={onCancel}>
              Назад
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
                  ← Назад
                </button>
                <span className="page-info">
                  Страница {pagination.page}
                </span>
                <button
                  className="btn btn-secondary"
                  disabled={!pagination.has_next_page}
                  onClick={() => setPage(page + 1)}
                >
                  Вперед →
                </button>
              </div>
            )}
            <button className="btn btn-secondary" onClick={onCancel}>
              Отмена
            </button>
          </>
        )}
      </div>
    </div>
  )
}
