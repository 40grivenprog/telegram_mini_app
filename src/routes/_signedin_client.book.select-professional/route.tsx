import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import SelectProfessional from './components/SelectProfessional'

export default function SelectProfessionalRoute() {
  const navigate = useNavigate()
  const { user } = useUser()

  if (!user) return null

  const handleSelect = (professionalID: string, professionalName: string) => {
    navigate(`/client/book/select-date/${professionalID}`, {
      state: { professionalName }
    })
  }

  const handleCancel = () => {
    navigate('/client/dashboard')
  }

  return <SelectProfessional clientID={user.id} onSelect={handleSelect} onCancel={handleCancel} />
}
