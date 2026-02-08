import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import SetUnavailable from './components/SetUnavailable'

export default function SetUnavailableRoute() {
  const navigate = useNavigate()
  const { user } = useUser()

  if (!user) return null

  return <SetUnavailable professionalID={user.id} />
}
