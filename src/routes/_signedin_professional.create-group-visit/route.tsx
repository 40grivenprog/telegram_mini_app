import React from 'react'
import { useUser } from '../../contexts/UserContext'
import CreateGroupVisit from './components/CreateGroupVisit'

export default function CreateGroupVisitRoute() {
  const { user } = useUser()

  if (!user) return null

  return <CreateGroupVisit professionalID={user.id} />
}
