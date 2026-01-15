import React from 'react'
import { useNavigate } from 'react-router-dom'
import RoleSelection from './components/RoleSelection'

export default function RoleSelectionRoute() {
  const navigate = useNavigate()

  const handleSelectRole = (role: 'client' | 'professional') => {
    if (role === 'client') {
      navigate('/client/register')
    } else {
      navigate('/professional/signin')
    }
  }

  return <RoleSelection onSelectRole={handleSelectRole} />
}
