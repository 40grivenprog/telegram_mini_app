import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useTelegram } from '../hooks/useTelegram'
import { apiService } from '../services/api'
import { Routes, type Route } from '../constants'
import RoleSelectionRoute from './role_selection/route'
import ClientRegistrationRoute from './client_registration/route'
import ProfessionalSignInRoute from './professional_signin/route'
import SuccessRoute from './success/route'
import LoadingRoute from './loading/route'
import ErrorRoute from './error/route'
import ClientDashboardRoute from './client_dashboard/route'
import SelectProfessionalRoute from './select_professional/route'
import SelectDateRoute from './select_date/route'
import SelectTimeRoute from './select_time/route'
import ConfirmAppointmentRoute from './confirm_appointment/route'
import ProfessionalDashboardRoute from './professional_dashboard/route'
import ProfessionalAppointmentsRoute from './professional_pending_appointments/route'
import '../App.css'

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
        }
        HapticFeedback: {
          notificationOccurred: (type: string) => void
        }
      }
    }
  }
}

export default function Route() {
  const { t, i18n } = useTranslation()
  const { chatID, initialized } = useTelegram()
  console.log("chatID", chatID)
  const [route, setRoute] = useState<Route>(Routes.LOADING)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Booking state
  const [selectedProfessionalID, setSelectedProfessionalID] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null)
  const [selectedEndTime, setSelectedEndTime] = useState<string | null>(null)

  // Fetch user on mount
  useEffect(() => {
    if (!initialized || !chatID) {
      return
    }

    const fetchUser = async () => {
      try {
        const userData = await apiService.getUserByChatID(chatID, i18n.language || 'en')
        if (userData && userData.user) {
          setUser(userData.user)
          // If client, go to dashboard, if professional go to professional dashboard
          if (userData.user.role === 'client') {
            setRoute(Routes.CLIENT_DASHBOARD)
          } else if (userData.user.role === 'professional') {
            setRoute(Routes.PROFESSIONAL_DASHBOARD)
          } else {
            setRoute(Routes.SUCCESS)
          }
        } else {
          setRoute(Routes.ROLE_SELECTION)
        }
      } catch (err) {
        setError(t('error.userCheckError'))
        setRoute(Routes.ERROR)
      }
    }

    fetchUser()
  }, [initialized, chatID])

  // Setup back button
  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (!tg) return

    // Hide back button on certain routes
    if (route === Routes.ROLE_SELECTION || 
        route === Routes.CLIENT_DASHBOARD || 
        route === Routes.PROFESSIONAL_DASHBOARD ||
        route === Routes.LOADING || 
        route === Routes.SUCCESS || 
        route === Routes.ERROR) {
      tg.BackButton.hide()
      return
    }

    // Show back button and handle navigation
    tg.BackButton.show()
    tg.BackButton.onClick(() => {
      if (route === Routes.CLIENT_REGISTRATION || route === Routes.PROFESSIONAL_SIGNIN) {
        setRoute(Routes.ROLE_SELECTION)
      } else if (route === Routes.SELECT_PROFESSIONAL) {
        setRoute(Routes.CLIENT_DASHBOARD)
        setSelectedProfessionalID(null)
      } else if (route === Routes.SELECT_DATE) {
        setRoute(Routes.SELECT_PROFESSIONAL)
        setSelectedDate(null)
      } else if (route === Routes.SELECT_TIME) {
        setRoute(Routes.SELECT_DATE)
        setSelectedStartTime(null)
        setSelectedEndTime(null)
      } else if (route === Routes.CONFIRM_APPOINTMENT) {
        setRoute(Routes.SELECT_TIME)
      } else if (route === Routes.PROFESSIONAL_PENDING_APPOINTMENTS) {
        setRoute(Routes.PROFESSIONAL_DASHBOARD)
      }
    })
  }, [route])

  // Render current route
  if (route === Routes.LOADING) {
    return <LoadingRoute />
  }

  if (route === Routes.ERROR) {
    return <ErrorRoute error={error} />
  }

  if (route === Routes.ROLE_SELECTION) {
    return <RoleSelectionRoute onSelectRole={(role) => {
      if (role === 'client') {
        setRoute(Routes.CLIENT_REGISTRATION)
      } else if (role === 'professional') {
        setRoute(Routes.PROFESSIONAL_SIGNIN)
      }
    }} />
  }

  if (route === Routes.CLIENT_REGISTRATION) {
    if (!chatID) return null
    return (
      <ClientRegistrationRoute
        chatID={chatID}
        onSuccess={(clientData) => {
          setUser(clientData)
          setRoute(Routes.CLIENT_DASHBOARD)
          const tg = window.Telegram?.WebApp
          if (tg) {
            tg.HapticFeedback.notificationOccurred('success')
          }
        }}
        onCancel={() => setRoute(Routes.ROLE_SELECTION)}
      />
    )
  }

  if (route === Routes.PROFESSIONAL_SIGNIN) {
    if (!chatID) return null
    return (
      <ProfessionalSignInRoute
        chatID={chatID}
        onSuccess={(userData) => {
          setUser(userData)
          setRoute(Routes.PROFESSIONAL_DASHBOARD)
          const tg = window.Telegram?.WebApp
          if (tg) {
            tg.HapticFeedback.notificationOccurred('success')
          }
        }}
        onCancel={() => setRoute(Routes.ROLE_SELECTION)}
      />
    )
  }

  if (route === Routes.SUCCESS) {
    return <SuccessRoute user={user} onNavigate={(r) => setRoute(r as Route)} />
  }

  if (route === Routes.CLIENT_DASHBOARD) {
    if (!user) return null
    return (
      <ClientDashboardRoute
        user={user}
        onBookAppointment={() => {
          setSelectedProfessionalID(null)
          setSelectedDate(null)
          setSelectedStartTime(null)
          setSelectedEndTime(null)
          setRoute(Routes.SELECT_PROFESSIONAL)
        }}
      />
    )
  }

  if (route === Routes.SELECT_PROFESSIONAL) {
    if (!user) return null
    return (
      <SelectProfessionalRoute
        clientID={user.id}
        onSelect={(professionalID) => {
          setSelectedProfessionalID(professionalID)
          setRoute(Routes.SELECT_DATE)
        }}
        onCancel={() => setRoute(Routes.CLIENT_DASHBOARD)}
      />
    )
  }

  if (route === Routes.SELECT_DATE) {
    if (!selectedProfessionalID) return null
    return (
      <SelectDateRoute
        professionalID={selectedProfessionalID}
        onSelect={(date) => {
          setSelectedDate(date)
          setRoute(Routes.SELECT_TIME)
        }}
        onCancel={() => setRoute(Routes.SELECT_PROFESSIONAL)}
      />
    )
  }

  if (route === Routes.SELECT_TIME) {
    if (!selectedProfessionalID || !selectedDate) return null
    return (
      <SelectTimeRoute
        professionalID={selectedProfessionalID}
        date={selectedDate}
        onSelect={(startTime, endTime) => {
          setSelectedStartTime(startTime)
          setSelectedEndTime(endTime)
          setRoute(Routes.CONFIRM_APPOINTMENT)
        }}
        onCancel={() => setRoute(Routes.SELECT_DATE)}
      />
    )
  }

  if (route === Routes.CONFIRM_APPOINTMENT) {
    if (!user || !selectedProfessionalID || !selectedDate || !selectedStartTime || !selectedEndTime) return null
    return (
      <ConfirmAppointmentRoute
        clientID={user.id}
        professionalID={selectedProfessionalID}
        date={selectedDate}
        startTime={selectedStartTime}
        endTime={selectedEndTime}
        onConfirm={async () => {
          // Clear booking state
          setSelectedProfessionalID(null)
          setSelectedDate(null)
          setSelectedStartTime(null)
          setSelectedEndTime(null)
          
          // Show success and return to dashboard
          const tg = window.Telegram?.WebApp
          if (tg) {
            tg.showAlert(t('common.appointmentCreated'))
          }
          setRoute(Routes.CLIENT_DASHBOARD)
        }}
        onCancel={() => setRoute(Routes.SELECT_TIME)}
      />
    )
  }

  if (route === Routes.PROFESSIONAL_DASHBOARD) {
    if (!user) return null
    return (
      <ProfessionalDashboardRoute
        user={user}
        onViewPendingAppointments={() => {
          setRoute(Routes.PROFESSIONAL_PENDING_APPOINTMENTS)
        }}
      />
    )
  }

  if (route === Routes.PROFESSIONAL_PENDING_APPOINTMENTS) {
    if (!user) return null
    return (
      <ProfessionalAppointmentsRoute
        professionalID={user.id}
        onBack={() => setRoute(Routes.PROFESSIONAL_DASHBOARD)}
      />
    )
  }

  return null
}
