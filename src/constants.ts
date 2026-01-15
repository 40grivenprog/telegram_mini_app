// App constants
export const Routes = {
  LOADING: 'loading',
  ROLE_SELECTION: 'role-selection',
  CLIENT_REGISTRATION: 'client-registration',
  PROFESSIONAL_SIGNIN: 'professional-signin',
  SUCCESS: 'success',
  ERROR: 'error',
  // Client routes
  CLIENT_DASHBOARD: 'client-dashboard',
  BOOK_APPOINTMENT: 'book-appointment',
  SELECT_PROFESSIONAL: 'select-professional',
  SELECT_DATE: 'select-date',
  SELECT_TIME: 'select-time',
  CONFIRM_APPOINTMENT: 'confirm-appointment',
  // Professional routes
  PROFESSIONAL_DASHBOARD: 'professional-dashboard',
  PROFESSIONAL_PENDING_APPOINTMENTS: 'professional-pending-appointments'
} as const

export type Route = typeof Routes[keyof typeof Routes]
