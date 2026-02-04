import React from 'react'
import { useNavigate } from 'react-router-dom'
import AllProfessionals from './components/AllProfessionals'

export default function AllProfessionalsRoute() {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate('/client/dashboard')
  }

  return <AllProfessionals onBack={handleBack} />
}
