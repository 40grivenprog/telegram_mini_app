import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Calendar from 'react-calendar'
import { X, Loader2, AlertCircle, Calendar as CalendarIcon, Tag, Users, Clock } from 'lucide-react'
import { useProfessionalsTimetable } from '../../../hooks/clients/useProfessionalsTimetable'
import { formatDate, formatTime } from '../../../utils/i18n'
import 'react-calendar/dist/Calendar.css'
import './ProfessionalTimetableModal.css'

interface ProfessionalTimetableModalProps {
  professionalID: string
  professionalName: string
  isOpen: boolean
  onClose: () => void
}

export default function ProfessionalTimetableModal({
  professionalID,
  professionalName,
  isOpen,
  onClose,
}: ProfessionalTimetableModalProps) {
  const { t } = useTranslation()
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [showCalendar, setShowCalendar] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)

  const { timetable, loading, error, refetch } = useProfessionalsTimetable(professionalID, selectedDate)

  // Close calendar on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setShowCalendar(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Reset date when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(todayStr)
    }
  }, [isOpen, todayStr])

  const handleDateSelect = (value: any) => {
    if (value instanceof Date) {
      const year = value.getFullYear()
      const month = String(value.getMonth() + 1).padStart(2, '0')
      const day = String(value.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      setSelectedDate(dateStr)
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
      return apt.clients && apt.clients.length > 0 ? (
        <p className="slot-client">
          <strong><Users size={16} /> {t('common.clients')}:</strong> {apt.clients.length} {t('professional.appointments.clientsCount')}
        </p>
      ) : null
    }
    return null
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
          <p>{t('professional.timetable.empty', { date: formatDateDisplay(selectedDate) })}</p>
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
          </div>
        ))}
      </div>
    )
  }

  if (!isOpen) return null

  // Parse date string as local date to avoid timezone issues
  const [year, month, day] = selectedDate.split('-').map(Number)
  const calendarDate = new Date(year, month - 1, day, 12, 0, 0, 0)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-large timetable-modal" onClick={(e) => e.stopPropagation()}>
        <div className="timetable-modal-header">
          <h2>{t('client.professionals.timetable.title', { name: professionalName })}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

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
              {formatDateDisplay(selectedDate)}
            </button>
            {showCalendar && (
              <div className="calendar-dropdown">
                <Calendar
                  onChange={handleDateSelect}
                  value={calendarDate}
                  locale={undefined}
                />
              </div>
            )}
          </div>
        </div>

        <div className="timetable-content">
          {renderAppointments()}
        </div>
      </div>
    </div>
  )
}
