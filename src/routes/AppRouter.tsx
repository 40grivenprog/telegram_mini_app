import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useTelegram } from '../hooks/useTelegram'
import { apiService } from '../services/api'
import { UserProvider, useUser } from '../contexts/UserContext'
import LoadingRoute from './loading/route'
import ErrorRoute from './error/route'
import RoleSelectionRoute from './role_selection/route'
import ClientRegistrationRoute from './client.registration/route'
import ProfessionalSignInRoute from './professional.signin/route'
import SuccessRoute from './success/route'
import ClientDashboardRoute from './_signedin_client.dashboard/route'
import SelectProfessionalRoute from './_signedin_client.book.select-professional/route'
import SelectDateRoute from './_signedin_client.book.select-date.$professionalID/route'
import SelectTimeRoute from './_signedin_client.book.select-time.$professionalID.$date/route'
import ConfirmAppointmentRoute from './_signedin_client.book.confirm/route'
import ClientAppointmentsRoute from './_signedin_client.appointments/route'
import ProfessionalDashboardRoute from './_signedin_professional.dashboard/route'
import ProfessionalAppointmentsRoute from './_signedin_professional.appointments/route'
import SelectUnavailableDateRoute from './_signedin_professional.set-unavailable.select-date/route'
import SelectUnavailableTimeRoute from './_signedin_professional.set-unavailable.select-time.$date/route'
import UnavailableDescriptionRoute from './_signedin_professional.set-unavailable.description/route'
import TimetableRoute from './_signedin_professional.timetable.$date/route'

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        expand: () => void
        enableClosingConfirmation: () => void
        BackButton: {
          show: () => void
          hide: () => void
          onClick: (callback: () => void) => void
          offClick: (callback: () => void) => void
        }
        HapticFeedback: {
          notificationOccurred: (type: string) => void
        }
        showAlert: (message: string) => void
      }
    }
  }
}

function AppRouterContent() {
  const { chatID, initialized } = useTelegram()
  const { user, setUser } = useUser()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch user on mount (only once)
  useEffect(() => {
    if (!initialized || !chatID) {
      setIsLoading(false)
      return
    }

    // If user already loaded, don't fetch again
    if (user !== null) {
      setIsLoading(false)
      return
    }

    // Don't fetch if we're already on registration/auth pages
    const authRoutes = ['/role-selection', '/client/register', '/professional/signin', '/loading', '/error', '/success']
    if (authRoutes.includes(location.pathname)) {
      setIsLoading(false)
      return
    }

    const fetchUser = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const userData = await apiService.getUserByChatID(chatID)
        if (userData && userData.user) {
          setUser(userData.user)
          // Set token in API service for authenticated requests
          if (userData.user.token) {
            apiService.setToken(userData.user.token)
          }
          // Redirect based on role
          if (userData.user.role === 'client') {
            navigate('/client/dashboard', { replace: true })
          } else if (userData.user.role === 'professional') {
            navigate('/professional/dashboard', { replace: true })
          } else {
            navigate('/success', { replace: true })
          }
        } else {
          navigate('/role-selection', { replace: true })
        }
      } catch (err) {
        // 404 is expected when user doesn't exist - redirect to role selection
        if (err.message?.includes('404') || err.message?.includes('not found')) {
          navigate('/role-selection', { replace: true })
        } else {
          setError('Ошибка при проверке пользователя')
          navigate('/error', { replace: true })
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [initialized, chatID, navigate, setUser, user, location.pathname])

  // Setup Telegram Back Button
  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (!tg) return

    const hideRoutes = ['/role-selection', '/client/dashboard', '/professional/dashboard', '/loading', '/success', '/error', '/']
    const shouldHide = hideRoutes.includes(location.pathname)

    if (shouldHide) {
      tg.BackButton.hide()
      return
    }

    tg.BackButton.show()
    const handleBack = () => {
      navigate(-1)
    }
    tg.BackButton.onClick(handleBack)

    return () => {
      tg.BackButton.offClick(handleBack)
    }
  }, [location.pathname, navigate])

  // Show loading only if we're on loading route or initializing
  if (isLoading && (location.pathname === '/loading' || location.pathname === '/')) {
    return <LoadingRoute />
  }

  return (
    <Routes>
      <Route path="/loading" element={<LoadingRoute />} />
      <Route path="/error" element={<ErrorRoute error={error} />} />
      <Route path="/role-selection" element={<RoleSelectionRoute />} />
      <Route path="/client/register" element={<ClientRegistrationRoute />} />
      <Route path="/professional/signin" element={<ProfessionalSignInRoute />} />
      <Route path="/success" element={<SuccessRoute />} />
      
      {/* Client routes */}
      <Route path="/client/dashboard" element={<ClientDashboardRoute />} />
      <Route path="/client/book/select-professional" element={<SelectProfessionalRoute />} />
      <Route path="/client/book/select-date/:professionalID" element={<SelectDateRoute />} />
      <Route path="/client/book/select-time/:professionalID/:date" element={<SelectTimeRoute />} />
      <Route path="/client/book/confirm" element={<ConfirmAppointmentRoute />} />
      <Route path="/client/appointments/:status" element={<ClientAppointmentsRoute />} />
      
      {/* Professional routes */}
      <Route path="/professional/dashboard" element={<ProfessionalDashboardRoute />} />
      <Route path="/professional/appointments/:status" element={<ProfessionalAppointmentsRoute />} />
      <Route path="/professional/set-unavailable/select-date" element={<SelectUnavailableDateRoute />} />
      <Route path="/professional/set-unavailable/select-time/:date" element={<SelectUnavailableTimeRoute />} />
      <Route path="/professional/set-unavailable/description" element={<UnavailableDescriptionRoute />} />
      <Route path="/professional/timetable/:date" element={<TimetableRoute />} />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/loading" replace />} />
      <Route path="*" element={<Navigate to="/loading" replace />} />
    </Routes>
  )
}

export default function AppRouter() {
  return (
    <UserProvider>
      <AppRouterContent />
    </UserProvider>
  )
}
