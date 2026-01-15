import React from 'react'
import { Routes } from '../../../constants'

interface SuccessProps {
  user: any
  onNavigate: (route: string) => void
}

export default function Success({ user, onNavigate }: SuccessProps) {
  // If user is client, navigate to dashboard
  React.useEffect(() => {
    if (user?.role === 'client') {
      onNavigate(Routes.CLIENT_DASHBOARD)
    }
  }, [user, onNavigate])

  return (
    <div className="container">
      <div className="success-screen">
        <h1>Hello World</h1>
        {user && (
          <div className="user-info">
            <p>Добро пожаловать, {user.first_name} {user.last_name}!</p>
            <p>Роль: {user.role}</p>
          </div>
        )}
      </div>
    </div>
  )
}
