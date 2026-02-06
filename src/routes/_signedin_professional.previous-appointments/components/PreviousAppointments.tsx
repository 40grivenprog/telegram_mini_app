import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Calendar from 'react-calendar'
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, Calendar as CalendarIcon, Tag, Users, Clock, Filter, X, Check, FileText } from 'lucide-react'
import { usePreviousAppointments } from '../hooks/usePreviousAppointments'
import { useCancelProfessionalAppointment } from '../../../hooks/professionals/useCancelProfessionalAppointment'
import { useAppointmentDetails, AppointmentDetails } from '../hooks/useAppointmentDetails'
import { useProfessionalSubscriptions, ProfessionalSubscription } from '../../_signedin_professional.previous-appointments.select-client/hooks/useProfessionalSubscriptions'
import { formatDate, formatTime } from '../../../utils/i18n'
import 'react-calendar/dist/Calendar.css'
import './PreviousAppointments.css'

interface PreviousAppointmentsProps {
  onBack: () => void
}

export default function PreviousAppointments({ onBack }: PreviousAppointmentsProps) {
  const { t } = useTranslation()

  // Filter state
  const [showFilters, setShowFilters] = useState(false)
  const [selectedClientID, setSelectedClientID] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState<Date | null>(null)
  const [dateTo, setDateTo] = useState<Date | null>(null)
  const [showDateFromCalendar, setShowDateFromCalendar] = useState(false)
  const [showDateToCalendar, setShowDateToCalendar] = useState(false)

  // Refs for calendar dropdown click outside
  const dateFromRef = useRef<HTMLDivElement>(null)
  const dateToRef = useRef<HTMLDivElement>(null)

  // Format dates for API (YYYY-MM-DD)
  const dateFromStr = dateFrom ? dateFrom.toISOString().split('T')[0] : null
  const dateToStr = dateTo ? dateTo.toISOString().split('T')[0] : null

  // Data hooks
  const { appointments, pagination, loading, error, page, setPage, refetch } = usePreviousAppointments(
    selectedClientID,
    1,
    15,
    dateFromStr,
    dateToStr
  )
  const { subscriptions } = useProfessionalSubscriptions()
  const { cancelAppointment, canceling, error: cancelError } = useCancelProfessionalAppointment()
  const { getAppointmentDetails, loading: detailsLoading } = useAppointmentDetails()

  // Modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedAppointmentID, setSelectedAppointmentID] = useState<string | null>(null)
  const [appointmentDetails, setAppointmentDetails] = useState<AppointmentDetails | null>(null)
  const [cancellationReason, setCancellationReason] = useState('')

  // Close calendar on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dateFromRef.current && !dateFromRef.current.contains(e.target as Node)) {
        setShowDateFromCalendar(false)
      }
      if (dateToRef.current && !dateToRef.current.contains(e.target as Node)) {
        setShowDateToCalendar(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const hasActiveFilters = selectedClientID !== null || dateFrom !== null || dateTo !== null

  const clearAllFilters = () => {
    setSelectedClientID(null)
    setDateFrom(null)
    setDateTo(null)
  }

  const formatDateDisplay = (date: Date | null): string => {
    if (!date) return ''
    return formatDate(date.toISOString(), { year: 'numeric', month: 'short', day: 'numeric' })
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

  const handleViewDetailsClick = async (appointmentID: string) => {
    setSelectedAppointmentID(appointmentID)
    setDetailsModalOpen(true)
    const details = await getAppointmentDetails(appointmentID)
    if (details) {
      setAppointmentDetails(details)
    }
  }

  const handleDetailsClose = () => {
    setDetailsModalOpen(false)
    setSelectedAppointmentID(null)
    setAppointmentDetails(null)
  }

  const handleCancelFromDetails = () => {
    if (!selectedAppointmentID) return
    setDetailsModalOpen(false)
    setCancellationReason(t('common.defaultCancelReason'))
    setCancelModalOpen(true)
  }

  const renderAppointmentType = (type: string) => {
    if (type === 'personal') return t('professional.appointments.types.personal')
    if (type === 'split') return t('professional.appointments.types.split')
    if (type === 'group') return t('professional.appointments.types.group')
    return type
  }

  const renderAppointments = () => {
    if (loading) {
      return (
        <div className="prev-appointments-status">
          <Loader2 size={32} className="spinner" />
          <p>{t('professional.previousAppointments.loading')}</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="prev-appointments-status prev-appointments-error">
          <AlertCircle size={32} />
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={refetch}>
            {t('common.tryAgain')}
          </button>
        </div>
      )
    }

    if (appointments.length === 0) {
      return (
        <div className="prev-appointments-status">
          <CalendarIcon size={40} className="empty-icon" />
          <p>{t('professional.previousAppointments.noAppointments')}</p>
        </div>
      )
    }

    return (
      <>
        <div className="appointments-list">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="appointment-card"
              onClick={() => handleViewDetailsClick(apt.id)}
            >
              <div className="appointment-details">
                {apt.type && (
                  <p className="appointment-type">
                    <strong><Tag size={16} /> {t('professional.appointments.type')}:</strong> {renderAppointmentType(apt.type)}
                  </p>
                )}
                <p className="appointment-date">
                  <strong><CalendarIcon size={16} /> {t('common.date')}:</strong> {formatDate(apt.start_time, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="appointment-time">
                  <strong><Clock size={16} /> {t('common.time')}:</strong> {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                </p>
                {apt.type === 'groupVisit' && apt.users_count > 0 && (
                  <p className="appointment-clients">
                    <strong><Users size={16} /> {t('common.clients')}:</strong> {apt.users_count} {t('professional.appointments.clientsCount')}
                  </p>
                )}
                {apt.description && apt.description.trim() && (
                  <p className="appointment-description">
                    <strong>{t('common.description')}:</strong> {apt.description}
                  </p>
                )}
              </div>
              <div className="appointment-actions">
                <button
                  className="btn btn-danger btn-small"
                  onClick={(e) => handleCancelClick(apt.id, e)}
                  disabled={canceling}
                >
                  {t('common.cancelAppointment')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {pagination && (pagination.has_next_page || pagination.page > 1 || appointments.length >= pagination.page_size) && (
          <div className="prev-appointments-pagination">
            <button
              className="btn btn-pagination"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft size={18} />
              {t('common.previous')}
            </button>
            <span className="page-indicator">
              {t('common.page')} {pagination.page}
            </span>
            <button
              className="btn btn-pagination"
              disabled={!pagination.has_next_page}
              onClick={() => setPage(page + 1)}
            >
              {t('common.next')}
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="prev-appointments-container">
      <div className="prev-appointments-wrapper">
        <header className="prev-appointments-header">
          <h1>{t('professional.previousAppointments.title')}</h1>
        </header>

        {/* Filter toggle */}
        <button
          className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
          style={{ marginBottom: showFilters ? 0 : 24 }}
        >
          <Filter size={16} />
          {t('professional.previousAppointments.filters.toggle')}
        </button>

        {/* Filters section */}
        {showFilters && (
          <div className="prev-appointments-filters">
            {/* Client filter */}
            <div className="filter-row">
              <span className="filter-label">
                <Users size={14} />
                {t('professional.previousAppointments.filters.byClient')}
              </span>
              <select
                className="filter-select"
                value={selectedClientID || ''}
                onChange={(e) => setSelectedClientID(e.target.value || null)}
              >
                <option value="">{t('professional.previousAppointments.filters.allClients')}</option>
                {subscriptions.map((sub: ProfessionalSubscription) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.first_name} {sub.last_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date from filter */}
            <div className="filter-row">
              <span className="filter-label">
                <CalendarIcon size={14} />
                {t('professional.previousAppointments.filters.dateFrom')}
              </span>
              <div className="calendar-picker-wrapper" ref={dateFromRef}>
                <button
                  className={`calendar-trigger ${dateFrom ? 'has-value' : 'placeholder'}`}
                  onClick={() => {
                    setShowDateFromCalendar(!showDateFromCalendar)
                    setShowDateToCalendar(false)
                  }}
                >
                  <CalendarIcon size={16} />
                  {dateFrom ? formatDateDisplay(dateFrom) : t('professional.previousAppointments.filters.selectDate')}
                  {dateFrom && (
                    <button
                      className="clear-date-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDateFrom(null)
                        setShowDateFromCalendar(false)
                      }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </button>
                {showDateFromCalendar && (
                  <div className="calendar-dropdown">
                    <Calendar
                      onChange={(value) => {
                        setDateFrom(value as Date)
                        setShowDateFromCalendar(false)
                      }}
                      value={dateFrom}
                      maxDate={dateTo || new Date()}
                      locale={undefined}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Date to filter */}
            <div className="filter-row">
              <span className="filter-label">
                <CalendarIcon size={14} />
                {t('professional.previousAppointments.filters.dateTo')}
              </span>
              <div className="calendar-picker-wrapper" ref={dateToRef}>
                <button
                  className={`calendar-trigger ${dateTo ? 'has-value' : 'placeholder'}`}
                  onClick={() => {
                    setShowDateToCalendar(!showDateToCalendar)
                    setShowDateFromCalendar(false)
                  }}
                >
                  <CalendarIcon size={16} />
                  {dateTo ? formatDateDisplay(dateTo) : t('professional.previousAppointments.filters.selectDate')}
                  {dateTo && (
                    <button
                      className="clear-date-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDateTo(null)
                        setShowDateToCalendar(false)
                      }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </button>
                {showDateToCalendar && (
                  <div className="calendar-dropdown">
                    <Calendar
                      onChange={(value) => {
                        setDateTo(value as Date)
                        setShowDateToCalendar(false)
                      }}
                      value={dateTo}
                      minDate={dateFrom || undefined}
                      maxDate={new Date()}
                      locale={undefined}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Active filters indicator */}
            {hasActiveFilters && (
              <div className="filters-active-bar">
                <span className="filters-active-text">
                  {t('professional.previousAppointments.filters.active')}
                </span>
                <button className="clear-filters-btn" onClick={clearAllFilters}>
                  {t('professional.previousAppointments.filters.clearAll')}
                </button>
              </div>
            )}
          </div>
        )}

        {cancelError && <div className="error-message">{cancelError}</div>}

        <div className="prev-appointments-content">
          {renderAppointments()}
        </div>

        {/* Details Modal */}
        {detailsModalOpen && (
          <div className="modal-overlay" onClick={handleDetailsClose}>
            <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
              <h2>{t('common.appointmentDetails')}</h2>
              {detailsLoading ? (
                <div className="loading">{t('common.loading')}</div>
              ) : appointmentDetails ? (
                <div className="appointment-details-content">
                  <section className="gv-summary">
                    <div className="summary-row">
                      <CalendarIcon size={16} />
                      <span className="summary-label">{t('common.date')}</span>
                      <span className="summary-value filled">
                        <Check size={14} className="check-icon" />
                        {formatDate(appointmentDetails.start_time, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="summary-row">
                      <Clock size={16} />
                      <span className="summary-label">{t('common.time')}</span>
                      <span className="summary-value filled">
                        <Check size={14} className="check-icon" />
                        {formatTime(appointmentDetails.start_time)} – {formatTime(appointmentDetails.end_time)}
                      </span>
                    </div>
                    {appointmentDetails.type && (
                      <div className="summary-row">
                        <Tag size={16} />
                        <span className="summary-label">{t('professional.appointments.type')}</span>
                        <span className="summary-value filled">
                          <Check size={14} className="check-icon" />
                          {t(`professional.appointments.types.${appointmentDetails.type}`)}
                        </span>
                      </div>
                    )}
                    {appointmentDetails.clients && appointmentDetails.clients.length > 0 && (
                      <div className="summary-row">
                        <Users size={16} />
                        <span className="summary-label">{t('common.clients')}</span>
                        <span className="summary-value filled">
                          <Check size={14} className="check-icon" />
                          {appointmentDetails.clients.length} {t('professional.appointments.clientsCount')}
                        </span>
                      </div>
                    )}
                    {appointmentDetails.description && appointmentDetails.description.trim() && (
                      <div className="summary-row">
                        <FileText size={16} />
                        <span className="summary-label">{t('common.description')}</span>
                        <span className="summary-value filled">
                          <Check size={14} className="check-icon" />
                          {appointmentDetails.description.trim().length > 30 ? appointmentDetails.description.trim().substring(0, 30) + '…' : appointmentDetails.description.trim()}
                        </span>
                      </div>
                    )}
                  </section>
                  {appointmentDetails.clients && appointmentDetails.clients.length > 0 && (
                    <div className="detail-section">
                      <h3 className="detail-section-title">
                        {t('common.clients')} ({appointmentDetails.clients.length})
                      </h3>
                      <div className="clients-list">
                        {appointmentDetails.clients.map((client) => (
                          <div key={client.id} className="client-item">
                            {client.first_name} {client.last_name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="error-message">{t('error.loadAppointmentsFailed')}</div>
              )}
              <div className="modal-actions">
                {appointmentDetails && (
                  <button
                    className="btn btn-danger"
                    onClick={handleCancelFromDetails}
                    disabled={canceling}
                  >
                    {t('common.cancelAppointment')}
                  </button>
                )}
                <button
                  className="btn btn-secondary"
                  onClick={handleDetailsClose}
                  disabled={canceling}
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        )}

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
                  className="btn btn-secondary"
                  onClick={handleCancelClose}
                  disabled={canceling}
                >
                  {t('common.back')}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleCancelConfirm}
                  disabled={canceling || !cancellationReason.trim()}
                >
                  {canceling ? t('common.canceling') : t('common.confirmCancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
