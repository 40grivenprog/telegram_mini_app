import React from 'react'
import './RoleSelection.css'

interface RoleSelectionProps {
  onSelectRole: (role: 'client' | 'professional') => void
}

export default function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  return (
    <div className="container">
      <header className="header">
        <h1>👋 Welcome to the Booking Bot!</h1>
        <p className="subtitle">Please choose how you want to continue:</p>
      </header>
      <div className="content">
        <div className="role-selection">
          <button
            type="button"
            className="btn btn-primary btn-large"
            onClick={() => onSelectRole('client')}
          >
            👤 Client
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-large"
            onClick={() => onSelectRole('professional')}
          >
            👨‍💼 Professional
          </button>
        </div>
      </div>
    </div>
  )
}
