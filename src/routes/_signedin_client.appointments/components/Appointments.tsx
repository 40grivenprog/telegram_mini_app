import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Calendar from 'react-calendar'
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, Calendar as CalendarIcon, User, FileText, Tag, Clock } from 'lucide-react'
import { useClientAppointments } from '../hooks/useClientAppointments'
import { useCancelAppointment } from '../hooks/useCancelAppointment'
import { formatDate, formatTime } from '../../../utils/i18n'
import 'react-calendar/dist/Calendar.css'
import './Appointments.css'

interface AppointmentsProps {
  onBack: () => void
}

export default function Appointments({ onBack }: AppointmentsProps) {
  const { t } = useTranslation()
  
  // Get both pending and confirmed appointments
  const pendingAppointments = useClientAppointments('pending', 100, true)
  const confirmedAppointments = useClientAppointments('confirmed', 100, true)
  const { cancelAppointment, canceling, error: cancelError } = useCancelAppointment()
  
  // Calendar state - use noon local time to avoid timezone issues
  const today = new Date()
  const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0, 0)
  const [selectedDate, setSelectedDate] = useState<Date>(todayLocal)
  const [showCalendar, setShowCalendar] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)

  // Modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [selectedAppointmentID, setSelectedAppointmentID] = useState<string | null>(null)
  const [cancellationReason, setCancellationReason] = useState('')

  // Close calendar on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setShowCalendar(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Combine and filter appointments for the selected date (only future dates)
  const appointmentsForDate = useMemo(() => {
    const allAppointments = [
      ...pendingAppointments.appointments,
      ...confirmedAppointments.appointments
    ]
    
    // Get selected date in YYYY-MM-DD format
    const selectedDateStr = selectedDate.toISOString().split('T')[0]
    const nowTime = new Date().getTime()
    
    // Filter appointments for selected date and only future dates
    return allAppointments
      .filter(apt => {
        // Extract date part from appointment start_time (YYYY-MM-DD)
        const aptDateStr = apt.start_time.split('T')[0]
        const aptTime = new Date(apt.start_time).getTime()
        
        return aptDateStr === selectedDateStr && aptTime >= nowTime
      })
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
  }, [pendingAppointments.appointments, confirmedAppointments.appointments, selectedDate])

  const handleDateSelect = (value: any) => {
    if (value instanceof Date) {
      // Create a new date at noon local time to avoid timezone issues
      const localDate = new Date(value.getFullYear(), value.getMonth(), value.getDate(), 12, 0, 0, 0)
      setSelectedDate(localDate)
      setShowCalendar(false)
    }
  }

  const formatDateDisplay = (date: Date): string => {
    // Format using local date values to avoid timezone shift
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()
    const localDateStr = new Date(year, month, day, 12, 0, 0).toISOString()
    return formatDate(localDateStr, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
  }

  const renderAppointmentType = (type?: string) => {
    if (!type) return null
    if (type === 'personal') {
      return t('professional.appointments.types.personal')
    } else if (type === 'split') {
      return t('professional.appointments.types.split')
    } else if (type === 'group') {
      return t('professional.appointments.types.group')
    }
    return type
  }

  const handleCancelClick = (appointmentID: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedAppointmentID(appointmentID)
    setCancellationReason(t('common.clientDefaultCancelReason'))
    setCancelModalOpen(true)
  }

  const handleCancelConfirm = async () => {
    if (!selectedAppointmentID || !cancellationReason.trim()) {
      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.showAlert(t('common.cancelReasonRequired'))
      }
      return
    }

    try {
      await cancelAppointment(selectedAppointmentID, cancellationReason.trim())
      setCancelModalOpen(false)
      setSelectedAppointmentID(null)
      setCancellationReason('')
      
      // Refetch both tabs
      await pendingAppointments.refetch()
      await confirmedAppointments.refetch()
      
      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.showAlert(t('common.appointmentCancelled'))
      }
    } catch {
      // Error is already handled by the hook
    }
  }

  const handleCancelClose = () => {
    setCancelModalOpen(false)
    setSelectedAppointmentID(null)
    setCancellationReason('')
  }

  const renderAppointments = () => {
    const loading = pendingAppointments.loading || confirmedAppointments.loading
    const error = pendingAppointments.error || confirmedAppointments.error

    if (loading) {
      return (
        <div className="appointments-status">
          <Loader2 size={32} className="spinner" />
          <p>{t('client.appointments.pendingTab.loading')}</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="appointments-status appointments-error">
          <AlertCircle size={32} />
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={() => {
            pendingAppointments.refetch()
            confirmedAppointments.refetch()
          }}>
            {t('common.tryAgain')}
          </button>
        </div>
      )
    }

    if (appointmentsForDate.length === 0) {
      return (
        <div className="appointments-status">
          <CalendarIcon size={40} className="empty-icon" />
          <p>{t('client.appointments.pendingTab.noAppointments')}</p>
        </div>
      )
    }

    return (
      <div className="appointments-list">
        {appointmentsForDate.map((apt) => (
          <div key={apt.id} className="appointment-card">
            <div className="appointment-details">
              {apt.professional && (
                <p className="coach-name">
                  <strong><User size={16} /> {t('common.coach')}:</strong> {apt.professional.first_name} {apt.professional.last_name}
                </p>
              )}
              {apt.type && (
                <p className="appointment-type">
                  <strong><Tag size={16} /> {t('professional.appointments.type')}:</strong> {renderAppointmentType(apt.type)}
                </p>
              )}
              <p className="appointment-time">
                <strong><Clock size={16} /> {t('common.time')}:</strong> {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
              </p>
              {apt.description && (
                <p className="appointment-description">
                  <strong><FileText size={16} /> {t('common.description')}:</strong> {apt.description}
                </p>
              )}
            </div>
            <div className="appointment-actions">
              <button
                className="btn btn-danger btn-small"
                onClick={(e) => handleCancelClick(apt.id, e)}
                disabled={canceling}
              >
                {t('client.appointments.cancel')}
              </button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="appointments-container">
      <div className="appointments-wrapper">
        <header className="appointments-header">
          <h1>{t('client.appointments.title')}</h1>
        </header>

        {/* Date selector */}
        <div className="appointments-date-selector">
          <span className="date-selector-label">
            <CalendarIcon size={14} />
            {t('common.date')}
          </span>
          <div className="calendar-picker-wrapper" ref={calendarRef}>
            <button
              className="calendar-trigger has-value"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <CalendarIcon size={16} />
              {formatDateDisplay(selectedDate)}
            </button>
            {showCalendar && (
              <div className="calendar-dropdown">
                <Calendar
                  onChange={handleDateSelect}
                  value={selectedDate}
                  minDate={today}
                  locale={undefined}
                />
              </div>
            )}
          </div>
        </div>

        {cancelError && <div className="error-message">{cancelError}</div>}

        <div className="appointments-content">
          {renderAppointments()}
        </div>

        {/* Cancel Modal */}
        {cancelModalOpen && (
          <div className="modal-overlay" onClick={handleCancelClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{t('common.cancelAppointment')}</h2>
              <p className="modal-subtitle">{t('common.cancelReasonPrompt')}</p>
              <textarea
                className="modal-textarea"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder={t('common.cancelReasonPlaceholder')}
                rows={4}
                disabled={canceling}
              />
              {cancelError && <div className="error-message">{cancelError}</div>}
              <div className="modal-actions">
                <button
                  className="btn btn-danger"
                  onClick={handleCancelConfirm}
                  disabled={canceling || !cancellationReason.trim()}
                >
                  {canceling ? t('common.canceling') : t('common.confirmCancel')}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleCancelClose}
                  disabled={canceling}
                >
                  {t('common.back')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
