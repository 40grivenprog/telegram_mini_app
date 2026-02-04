import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import SelectDate from './components/SelectDate'

export default function SelectGroupVisitDateRoute() {
  const navigate = useNavigate()
  const { user } = useUser()

  if (!user) return null

  const handleSelect = (date: string) => {
    navigate(`/professional/create-group-visit/select-time/${date}`)
  }

  const handleCancel = () => {
    navigate('/professional/dashboard')
  }

  return <SelectDate professionalID={user.id} onSelect={handleSelect} onCancel={handleCancel} />
}
