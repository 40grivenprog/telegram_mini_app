import React from 'react'
import { useUser } from '../../contexts/UserContext'
import Packages from './components/Packages'

export default function PackagesRoute() {
  const { user } = useUser()

  if (!user) return null

  return <Packages professionalID={user.id} />
}
