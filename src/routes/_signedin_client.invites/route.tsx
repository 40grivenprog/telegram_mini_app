import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Invites from './components/Invites'

interface ClientInvitesState {
  inviteID?: string
}

export default function ClientInvitesRoute() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as ClientInvitesState | null
  const initialInviteID = state?.inviteID || null

  const handleBack = () => {
    navigate('/client/dashboard')
  }

  return <Invites onBack={handleBack} initialInviteID={initialInviteID} />
}
