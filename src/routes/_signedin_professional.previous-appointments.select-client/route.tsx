import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import SelectClient from './components/SelectClient'

export default function SelectClientRoute() {
  const navigate = useNavigate()
  const { user } = useUser()

  if (!user) return null

  const handleSelect = (clientID: string, clientName: string) => {
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
    navigate(`/professional/previous-appointments/${clientID}/${currentMonth}`, {
      state: { clientName }
    })
  }

  const handleCancel = () => {
    navigate('/professional/dashboard')
  }

  return <SelectClient professionalID={user.id} onSelect={handleSelect} onCancel={handleCancel} />
}
