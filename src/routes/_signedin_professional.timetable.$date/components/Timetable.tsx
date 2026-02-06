import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Calendar from 'react-calendar'
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, Calendar as CalendarIcon, Tag, Users, Clock, X } from 'lucide-react'
import { useProfessionalTimetable } from '../hooks/useProfessionalTimetable'
import { useCancelProfessionalAppointment } from '../../../hooks/professionals/useCancelProfessionalAppointment'
import { formatDate, formatTime } from '../../../utils/i18n'
import 'react-calendar/dist/Calendar.css'
import './Timetable.css'

interface TimetableProps {
  professionalID: string
  date: string
  onBack: () => void
  onDateChange: (newDate: string) => void
}

export default function Timetable({
  professionalID,
  date,
  onBack,
  onDateChange,
}: TimetableProps) {
  const { t } = useTranslation()
  const { timetable, loading, error, refetch } = useProfessionalTimetable(professionalID, date)
  const { cancelAppointment, canceling, error: cancelError } = useCancelProfessionalAppointment()
  
  // Calendar state
  const [showCalendar, setShowCalendar] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)
  // Parse date string as local date to avoid timezone issues
  const [year, month, day] = date.split('-').map(Number)
  const selectedDate = new Date(year, month - 1, day, 12, 0, 0, 0)

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

  const handleDateSelect = (value: any) => {
    if (value instanceof Date) {
      // Format date as YYYY-MM-DD using local date values to avoid timezone shift
      const year = value.getFullYear()
      const month = String(value.getMonth() + 1).padStart(2, '0')
      const day = String(value.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      onDateChange(dateStr)
      setShowCalendar(false)
    }
  }

  const formatDateDisplay = (dateStr: string): string => {
    return formatDate(dateStr, { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const renderAppointmentType = (type: string) => {
    if (type === 'personal') {
      return t('professional.appointments.types.personal')
    } else if (type === 'split') {
      return t('professional.appointments.types.split')
    } else if (type === 'group') {
      return t('professional.appointments.types.group')
    } else if (type === 'unavailable') {
      return t('professional.appointments.types.unavailable')
    }
    return type
  }

  const renderClientInfo = (apt: any) => {
    if (apt.type === 'personal') {
      return apt.clients && apt.clients.length > 0 ? (
        <p className="slot-client">
          <strong><Users size={16} /> {t('common.client')}:</strong> {apt.clients[0]}
        </p>
      ) : null
    } else if (apt.type === 'split') {
      return apt.clients && apt.clients.length > 0 ? (
        <p className="slot-client">
          <strong><Users size={16} /> {t('common.clients')}:</strong> {apt.clients.length} {t('professional.appointments.clientsCount')}
        </p>
      ) : null
    } else if (apt.type === 'group' || apt.type === 'groupVisit') {
      return apt.clients ? (
        <p className="slot-client">
          <strong><Users size={16} /> {t('common.clients')}:</strong> {apt.clients.length} {t('professional.appointments.clientsCount')}
        </p>
      ) : null
    }
    return null
  }

  const handleCancelClick = (appointmentID: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedAppointmentID(appointmentID)
    setCancellationReason(t('common.defaultCancelReason'))
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
      await refetch()
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
    if (loading) {
      return (
        <div className="timetable-status">
          <Loader2 size={32} className="spinner" />
          <p>{t('professional.timetable.loading')}</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="timetable-status timetable-error">
          <AlertCircle size={32} />
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={refetch}>
            {t('common.tryAgain')}
          </button>
        </div>
      )
    }

    if (!timetable || timetable.appointments.length === 0) {
      return (
        <div className="timetable-status">
          <CalendarIcon size={40} className="empty-icon" />
          <p>{t('professional.timetable.empty', { date: formatDateDisplay(date) })}</p>
        </div>
      )
    }

    return (
      <div className="timetable-appointments">
        {timetable.appointments.map((apt) => (
          <div key={apt.id} className="timetable-slot">
            <div className="slot-details">
              {apt.type && (
                <p className="slot-type">
                  <strong><Tag size={16} /> {t('professional.appointments.type')}:</strong> {renderAppointmentType(apt.type)}
                </p>
              )}
              {renderClientInfo(apt)}
              <p className="slot-time">
                <strong><Clock size={16} /> {t('common.time')}:</strong> {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
              </p>
              {apt.description && apt.description.trim() && (
                <p className="slot-description">
                  <strong>{t('common.description')}:</strong> {apt.description}
                </p>
              )}
            </div>
            <div className="slot-actions">
              <button
                className="btn btn-danger btn-block"
                onClick={(e) => handleCancelClick(apt.id, e)}
                disabled={canceling}
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="timetable-container">
      <div className="timetable-wrapper">
        <header className="timetable-header">
          <h1>{t('professional.timetable.title')}</h1>
        </header>

        {/* Date selector */}
        <div className="timetable-date-selector">
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
              {formatDateDisplay(date)}
            </button>
            {showCalendar && (
              <div className="calendar-dropdown">
                <Calendar
                  onChange={handleDateSelect}
                  value={selectedDate}
                  locale={undefined}
                />
              </div>
            )}
          </div>
        </div>

        {cancelError && <div className="error-message">{cancelError}</div>}

        <div className="timetable-content">
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
                  className="btn btn-danger btn-block"
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
