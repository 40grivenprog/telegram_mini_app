import React from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import PreviousAppointments from './components/PreviousAppointments'

export default function PreviousAppointmentsRoute() {
  const navigate = useNavigate()
  const { clientID, month } = useParams<{ clientID: string; month: string }>()
  const location = useLocation()
  const { user } = useUser()

  if (!user || !clientID || !month) return null

  const clientName = (location.state as { clientName?: string } | null)?.clientName || ''

  const handleBack = () => {
    navigate('/professional/previous-appointments/select-client')
  }

  const handleMonthChange = (newMonth: string) => {
    navigate(`/professional/previous-appointments/${clientID}/${newMonth}`, {
      replace: true,
      state: { clientName }
    })
  }

  return (
    <PreviousAppointments
      professionalID={user.id}
      clientID={clientID}
      clientName={clientName}
      month={month}
      onBack={handleBack}
      onMonthChange={handleMonthChange}
    />
  )
}
