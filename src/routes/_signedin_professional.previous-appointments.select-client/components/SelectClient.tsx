import React from 'react'
import { useProfessionalClients } from '../hooks/useProfessionalClients'
import './SelectClient.css'

interface SelectClientProps {
  professionalID: string
  onSelect: (clientID: string, clientName: string) => void
  onCancel: () => void
}

export default function SelectClient({ professionalID, onSelect, onCancel }: SelectClientProps) {
  const { clients, loading, error, refetch } = useProfessionalClients(professionalID)

  if (loading) {
    return (
      <div className="container">
        <div className="loading-screen">
          <div className="loading">Загрузка клиентов...</div>
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
        <h1>👥 Select a client</h1>
        <p className="subtitle">Select a client to view their previous appointments:</p>
      </header>
      <div className="content">
        {clients.length === 0 ? (
          <div className="empty-state">
            <p>No clients found</p>
          </div>
        ) : (
          <div className="clients-list">
            {clients.map((client) => (
              <button
                key={client.id}
                className="client-button"
                onClick={() => onSelect(client.id, `${client.first_name} ${client.last_name}`)}
              >
                <div className="client-name">
                  {client.first_name} {client.last_name}
                </div>
              </button>
            ))}
          </div>
        )}
        <div className="actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
