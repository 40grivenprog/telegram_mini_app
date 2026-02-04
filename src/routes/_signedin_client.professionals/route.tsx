import React from 'react'
import { useNavigate } from 'react-router-dom'
import Professionals from './components/Professionals'

export default function ProfessionalsRoute() {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate('/client/dashboard')
  }

  return <Professionals onBack={handleBack} />
}
