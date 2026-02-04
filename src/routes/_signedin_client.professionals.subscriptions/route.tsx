import React from 'react'
import { useNavigate } from 'react-router-dom'
import MySubscriptions from './components/MySubscriptions'

export default function MySubscriptionsRoute() {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate('/client/dashboard')
  }

  return <MySubscriptions onBack={handleBack} />
}
