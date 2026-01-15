import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import Success from './components/Success'

export default function SuccessRoute() {
  const navigate = useNavigate()
  const { user } = useUser()

  const handleNavigate = (route: string) => {
    navigate(route)
  }

  return <Success user={user} onNavigate={handleNavigate} />
}
