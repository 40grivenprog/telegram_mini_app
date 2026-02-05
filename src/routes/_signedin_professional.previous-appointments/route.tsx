import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import PreviousAppointments from './components/PreviousAppointments'

interface PreviousAppointmentsState {
  clientID: string | null
  clientName: string
}

export default function PreviousAppointmentsRoute() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useUser()

  if (!user) return null

  const state = location.state as PreviousAppointmentsState | null

  if (!state) {
    navigate('/professional/previous-appointments/select-client')
    return null
  }

  const handleBack = () => {
    navigate('/professional/previous-appointments/select-client')
  }

  return (
    <PreviousAppointments
      clientID={state.clientID}
      clientName={state.clientName}
      onBack={handleBack}
    />
  )
}
