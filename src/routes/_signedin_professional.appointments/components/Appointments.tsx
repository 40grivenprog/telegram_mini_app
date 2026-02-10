import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Clock, CheckCircle, ChevronLeft, ChevronRight, Loader2, AlertCircle, Calendar, Tag, User, Users, Check, FileText, Edit2, AlertTriangle, UserPlus, Send } from 'lucide-react'
import { useProfessionalAppointments } from '../hooks/useProfessionalAppointments'
import { useConfirmAppointment } from '../hooks/useConfirmAppointment'
import { useCancelProfessionalAppointment } from '../../../hooks/professionals/useCancelProfessionalAppointment'
import { useUpdateAppointment } from '../../../hooks/professionals/useUpdateAppointment'
import { useInviteForAppointment, InviteClient } from '../../../hooks/professionals/useInviteForAppointment'
import { useMissingInviteUsers, MissingInviteUser } from '../../../hooks/professionals/useMissingInviteUsers'
import { usePendingInviteUsers, PendingInviteUser } from '../../../hooks/professionals/usePendingInviteUsers'
import { useAppointmentDetails, AppointmentDetails } from '../../_signedin_professional.previous-appointments/hooks/useAppointmentDetails'
import { removeAppointmentParamFromURL } from '../../../utils/urlParams'
import { formatDate, formatTime } from '../../../utils/i18n'
import './Appointments.css'

interface AppointmentsProps {
  onBack: () => void
  initialAppointmentID?: string
}

type Tab = 'pending' | 'confirmed'

export default function Appointments({ onBack, initialAppointmentID }: AppointmentsProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<Tab>('pending')
  const paramRemovedRef = useRef(false)

  const pendingAppointments = useProfessionalAppointments('pending', 15, activeTab === 'pending')
  const confirmedAppointments = useProfessionalAppointments('confirmed', 15, activeTab === 'confirmed')
  const { confirmAppointment, confirming, error: confirmError } = useConfirmAppointment()
  const { cancelAppointment, canceling, error: cancelError } = useCancelProfessionalAppointment()
  const { updateAppointment, updating, error: updateError } = useUpdateAppointment()
  const { inviteForAppointment, inviting, error: inviteError } = useInviteForAppointment()
  const { getMissingInviteUsers, loading: missingUsersLoading } = useMissingInviteUsers()
  const { getPendingInviteUsers, loading: pendingUsersLoading } = usePendingInviteUsers()
  const { getAppointmentDetails, loading: detailsLoading } = useAppointmentDetails()
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedAppointmentID, setSelectedAppointmentID] = useState<string | null>(null)
  const [appointmentDetails, setAppointmentDetails] = useState<AppointmentDetails | null>(null)
  const [cancellationReason, setCancellationReason] = useState('')

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false)
  const [editDescription, setEditDescription] = useState('')
  const [editType, setEditType] = useState('')
  const [missingInviteUsers, setMissingInviteUsers] = useState<MissingInviteUser[]>([])
  const [selectedInviteUsers, setSelectedInviteUsers] = useState<Set<string>>(new Set())
  const [pendingInviteUsers, setPendingInviteUsers] = useState<PendingInviteUser[]>([])

  // Helper function to remove appointment parameter from URL (deep link cleanup)
  const removeAppointmentParam = () => {
    if (initialAppointmentID && !paramRemovedRef.current) {
      removeAppointmentParamFromURL()
      paramRemovedRef.current = true
    }
  }

  // Open appointment details if initialAppointmentID is provided
  useEffect(() => {
    if (initialAppointmentID && !detailsModalOpen) {
      const openDetails = async () => {
        setSelectedAppointmentID(initialAppointmentID)
        setDetailsModalOpen(true)

        const details = await getAppointmentDetails(initialAppointmentID)
        if (details) {
          setAppointmentDetails(details)
        } else {
          // If appointment not found, it was probably deleted or cancelled
          setAppointmentDetails(null)
        }
        // Fetch pending invite users and missing invite users in parallel
        const [pendingUsers, users] = await Promise.all([
          getPendingInviteUsers(initialAppointmentID),
          getMissingInviteUsers(initialAppointmentID),
        ])
        setPendingInviteUsers(pendingUsers)
        setMissingInviteUsers(users)
      }
      // Wait a bit for appointments to load first
      const timer = setTimeout(() => {
        openDetails()
      }, 500)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAppointmentID])

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    // Reset pagination when switching tabs
    if (tab === 'pending') {
      pendingAppointments.setPage(1)
    } else {
      confirmedAppointments.setPage(1)
    }
  }

  const handleCancelClick = (appointmentID: string) => {
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
      // Refetch the active tab
      if (activeTab === 'pending') {
        await pendingAppointments.refetch()
      } else {
        await confirmedAppointments.refetch()
      }
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
    // Fetch pending invite users and missing invite users in parallel
    const [pendingUsers, users] = await Promise.all([
      getPendingInviteUsers(appointmentID),
      getMissingInviteUsers(appointmentID),
    ])
    setPendingInviteUsers(pendingUsers)
    setMissingInviteUsers(users)
  }

  const handleDetailsClose = () => {
    setDetailsModalOpen(false)
    setSelectedAppointmentID(null)
    setAppointmentDetails(null)
    setIsEditMode(false)
    setEditDescription('')
    setEditType('')
    setMissingInviteUsers([])
    setSelectedInviteUsers(new Set())
    setPendingInviteUsers([])
    removeAppointmentParam()
  }

  const handleConfirmFromDetails = async () => {
    if (!selectedAppointmentID) return

    try {
      await confirmAppointment(selectedAppointmentID)
      setDetailsModalOpen(false)
      setSelectedAppointmentID(null)
      setAppointmentDetails(null)
      removeAppointmentParam()
      // Refetch the active tab
      if (activeTab === 'pending') {
        await pendingAppointments.refetch()
      } else {
        await confirmedAppointments.refetch()
      }
      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.showAlert(t('common.appointmentConfirmed'))
      }
    } catch {
      // Error is already handled by the hook
    }
  }

  const handleCancelFromDetails = () => {
    if (!selectedAppointmentID) return
    setDetailsModalOpen(false)
    setIsEditMode(false)
    setCancellationReason(t('common.defaultCancelReason'))
    setCancelModalOpen(true)
    removeAppointmentParam()
  }

  // Edit mode handlers - type validation based ONLY on confirmed clients
  const getSuggestedType = (clientCount: number): string => {
    if (clientCount === 1) return 'personal'
    if (clientCount === 2) return 'split'
    return 'group'
  }

  const getTypeValidationError = (): string | null => {
    if (!appointmentDetails) return null
    // Only count confirmed/existing clients for type validation
    const confirmedClientCount = appointmentDetails.clients?.length || 0

    if (editType === 'personal' && confirmedClientCount !== 1) {
      return t('professional.editAppointment.personalNeedOneClient')
    }
    if (editType === 'split' && confirmedClientCount !== 2) {
      return t('professional.editAppointment.splitNeedTwoClients')
    }
    if (editType === 'group' && confirmedClientCount < 3) {
      return t('professional.editAppointment.groupNeedThreeClients')
    }
    return null
  }

  const handleEnterEditMode = async () => {
    if (!appointmentDetails || !selectedAppointmentID) return

    setIsEditMode(true)
    setEditDescription(appointmentDetails.description || '')
    setEditType(appointmentDetails.type || 'personal')
  }

  const handleSaveEdit = async () => {
    if (!selectedAppointmentID || !appointmentDetails) return

    const typeError = getTypeValidationError()
    if (typeError) {
      const tg = (window as any).Telegram?.WebApp
      if (tg) tg.showAlert(typeError)
      return
    }

    try {
      await updateAppointment(selectedAppointmentID, {
        description: editDescription.trim(),
        type: editType,
      })

      setIsEditMode(false)
      setDetailsModalOpen(false)
      setSelectedAppointmentID(null)
      setAppointmentDetails(null)
      await confirmedAppointments.refetch()

      const tg = (window as any).Telegram?.WebApp
      if (tg) tg.showAlert(t('professional.editAppointment.updateSuccess'))
    } catch {
      // Error handled by hook
    }
  }

  const handleSendInvite = async () => {
    if (!selectedAppointmentID || selectedInviteUsers.size === 0) return

    const clients: InviteClient[] = Array.from(selectedInviteUsers)
      .map(userId => {
        const user = missingInviteUsers.find(u => u.id === userId)
        if (!user) return null
        return { id: user.id, chat_id: user.chat_id, locale: user.locale }
      })
      .filter((c): c is InviteClient => c !== null)

    if (clients.length === 0) return

    try {
      await inviteForAppointment(selectedAppointmentID, clients)

      setSelectedInviteUsers(new Set())
      // Refresh missing invite users and pending invite users
      const [users, pendingUsers] = await Promise.all([
        getMissingInviteUsers(selectedAppointmentID),
        getPendingInviteUsers(selectedAppointmentID),
      ])
      setMissingInviteUsers(users)
      setPendingInviteUsers(pendingUsers)

      const tg = (window as any).Telegram?.WebApp
      if (tg) tg.showAlert(t('professional.editAppointment.inviteSuccess'))
    } catch {
      // Error handled by hook
    }
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    setEditDescription('')
    setEditType('')
  }

  const handleInviteUserToggle = (userId: string, checked: boolean) => {
    setSelectedInviteUsers(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(userId)
      } else {
        newSet.delete(userId)
      }
      return newSet
    })
  }

  const renderClientInfo = (apt: any) => {
    if (apt.type === 'personal') {
      return apt.clients && apt.clients.length > 0 ? (
        <p className="client-name">
          <strong><User size={16} /> {t('common.client')}:</strong> {apt.clients[0]}
        </p>
      ) : null
    } else if (apt.type === 'split') {
      return apt.clients && apt.clients.length > 0 ? (
        <p className="client-name">
          <strong><Users size={16} /> {t('common.clients')}:</strong> {apt.clients.length} {t('professional.appointments.clientsCount')}
        </p>
      ) : null
    } else if (apt.type === 'group') {
      return apt.clients ? (
        <p className="client-name">
          <strong><Users size={16} /> {t('common.clients')}:</strong> {apt.clients.length} {t('professional.appointments.clientsCount')}
        </p>
      ) : null
    }
    return null
  }

  const renderAppointmentType = (type: string) => {
    if (type === 'personal') {
      return t('professional.appointments.types.personal')
    } else if (type === 'split') {
      return t('professional.appointments.types.split')
    } else if (type === 'group') {
      return t('professional.appointments.types.group')
    }
    return type
  }

  const renderPendingAppointments = () => {
    if (pendingAppointments.loading) {
      return (
        <div className="appointments-status">
          <Loader2 size={32} className="spinner" />
          <p>{t('professional.appointments.pendingTab.loading')}</p>
        </div>
      )
    }

    if (pendingAppointments.error) {
      return (
        <div className="appointments-status appointments-error">
          <AlertCircle size={32} />
          <p>{pendingAppointments.error}</p>
          <button className="btn btn-secondary" onClick={pendingAppointments.refetch}>
            {t('common.tryAgain')}
          </button>
        </div>
      )
    }

    if (pendingAppointments.appointments.length === 0) {
      return (
        <div className="appointments-status">
          <Clock size={40} className="empty-icon" />
          <p>{t('professional.appointments.pendingTab.noAppointments')}</p>
        </div>
      )
    }

    return (
      <>
        <div className="appointments-list">
          {pendingAppointments.appointments.map((apt) => (
            <div
              key={apt.id}
              className="appointment-card appointment-card-clickable"
              onClick={() => handleViewDetailsClick(apt.id)}
            >
              <div className="appointment-details">
                <p className="appointment-type">
                  <strong><Tag size={16} /> {t('professional.appointments.type')}:</strong> {renderAppointmentType(apt.type)}
                </p>
                {renderClientInfo(apt)}
                <p className="appointment-date">
                  <strong><Calendar size={16} /> {t('common.date')}:</strong> {formatDate(apt.start_time, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="appointment-time">
                  <strong><Clock size={16} /> {t('common.time')}:</strong> {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                </p>
              </div>
            </div>
          ))}
        </div>
        {pendingAppointments.pagination && (pendingAppointments.pagination.has_next_page || pendingAppointments.pagination.page > 1 || pendingAppointments.appointments.length >= pendingAppointments.pagination.page_size) && (
          <div className="appointments-pagination">
            <button
              className="btn btn-pagination"
              disabled={pendingAppointments.page === 1}
              onClick={() => pendingAppointments.setPage(pendingAppointments.page - 1)}
            >
              <ChevronLeft size={18} />
              {t('common.previous')}
            </button>
            <span className="page-indicator">
              {t('common.page')} {pendingAppointments.pagination.page}
            </span>
            <button
              className="btn btn-pagination"
              disabled={!pendingAppointments.pagination.has_next_page}
              onClick={() => pendingAppointments.setPage(pendingAppointments.page + 1)}
            >
              {t('common.next')}
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </>
    )
  }

  const renderConfirmedAppointments = () => {
    if (confirmedAppointments.loading) {
      return (
        <div className="appointments-status">
          <Loader2 size={32} className="spinner" />
          <p>{t('professional.appointments.confirmedTab.loading')}</p>
        </div>
      )
    }

    if (confirmedAppointments.error) {
      return (
        <div className="appointments-status appointments-error">
          <AlertCircle size={32} />
          <p>{confirmedAppointments.error}</p>
          <button className="btn btn-secondary" onClick={confirmedAppointments.refetch}>
            {t('common.tryAgain')}
          </button>
        </div>
      )
    }

    if (confirmedAppointments.appointments.length === 0) {
      return (
        <div className="appointments-status">
          <CheckCircle size={40} className="empty-icon" />
          <p>{t('professional.appointments.confirmedTab.noAppointments')}</p>
        </div>
      )
    }

    return (
      <>
        <div className="appointments-list">
          {confirmedAppointments.appointments.map((apt) => (
            <div
              key={apt.id}
              className="appointment-card appointment-card-clickable"
              onClick={() => handleViewDetailsClick(apt.id)}
            >
              <div className="appointment-details">
                <p className="appointment-type">
                  <strong><Tag size={16} /> {t('professional.appointments.type')}:</strong> {renderAppointmentType(apt.type)}
                </p>
                {renderClientInfo(apt)}
                <p className="appointment-date">
                  <strong><Calendar size={16} /> {t('common.date')}:</strong> {formatDate(apt.start_time, { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="appointment-time">
                  <strong><Clock size={16} /> {t('common.time')}:</strong> {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                </p>
              </div>
            </div>
          ))}
        </div>
        {confirmedAppointments.pagination && (confirmedAppointments.pagination.has_next_page || confirmedAppointments.pagination.page > 1 || confirmedAppointments.appointments.length >= confirmedAppointments.pagination.page_size) && (
          <div className="appointments-pagination">
            <button
              className="btn btn-pagination"
              disabled={confirmedAppointments.page === 1}
              onClick={() => confirmedAppointments.setPage(confirmedAppointments.page - 1)}
            >
              <ChevronLeft size={18} />
              {t('common.previous')}
            </button>
            <span className="page-indicator">
              {t('common.page')} {confirmedAppointments.pagination.page}
            </span>
            <button
              className="btn btn-pagination"
              disabled={!confirmedAppointments.pagination.has_next_page}
              onClick={() => confirmedAppointments.setPage(confirmedAppointments.page + 1)}
            >
              {t('common.next')}
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </>
    )
  }

  // Type suggestion based only on confirmed clients
  const confirmedClientCount = appointmentDetails?.clients?.length || 0
  const suggestedType = getSuggestedType(confirmedClientCount)
  const typeValidationError = isEditMode ? getTypeValidationError() : null

  return (
    <div className="appointments-container">
      <div className="appointments-wrapper">
        <header className="appointments-header">
          <h1>{t('professional.appointments.title')}</h1>
        </header>

        <div className="appointments-tabs">
          <button
            className={`appointments-tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => handleTabChange('pending')}
          >
            <Clock size={18} />
            {t('professional.appointments.pending')}
          </button>
          <button
            className={`appointments-tab ${activeTab === 'confirmed' ? 'active' : ''}`}
            onClick={() => handleTabChange('confirmed')}
          >
            <CheckCircle size={18} />
            {t('professional.appointments.confirmed')}
          </button>
        </div>

        {confirmError && <div className="error-message">{confirmError}</div>}
        {cancelError && <div className="error-message">{cancelError}</div>}

        <div className="appointments-content">
          {activeTab === 'pending' ? renderPendingAppointments() : renderConfirmedAppointments()}
        </div>

        {/* Details Modal */}
        {detailsModalOpen && (
          <div className="modal-overlay" onClick={handleDetailsClose}>
            <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
              <h2>{isEditMode ? t('professional.editAppointment.title') : t('common.appointmentDetails')}</h2>
              {detailsLoading ? (
                <div className="loading">{t('common.loading')}</div>
              ) : appointmentDetails ? (
                <div className="appointment-details-content">
                  {/* Warning banner in edit mode */}
                  {isEditMode && (
                    <div className="edit-warning">
                      <AlertTriangle size={16} />
                      <span>{t('professional.editAppointment.timeChangeWarning')}</span>
                    </div>
                  )}

                  <section className="gv-summary">
                    <div className="summary-row">
                      <Calendar size={16} />
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
                    {!isEditMode && appointmentDetails.type && (
                      <div className="summary-row">
                        <Tag size={16} />
                        <span className="summary-label">{t('professional.appointments.type')}</span>
                        <span className="summary-value filled">
                          <Check size={14} className="check-icon" />
                          {t(`professional.appointments.types.${appointmentDetails.type}`)}
                        </span>
                      </div>
                    )}
                    {!isEditMode && appointmentDetails.clients && appointmentDetails.clients.length > 0 && (
                      <div className="summary-row">
                        <Users size={16} />
                        <span className="summary-label">{t('common.clients')}</span>
                        <span className="summary-value filled">
                          <Check size={14} className="check-icon" />
                          {appointmentDetails.clients.length} {t('professional.appointments.clientsCount')}
                        </span>
                      </div>
                    )}
                    {!isEditMode && appointmentDetails.description && appointmentDetails.description.trim() && (
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

                  {/* Edit mode: description textarea */}
                  {isEditMode && (
                    <>
                      <div className="edit-section-label">
                        <FileText size={14} />
                        {t('professional.editAppointment.description')}
                      </div>
                      <textarea
                        className="modal-textarea"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder={t('professional.editAppointment.descriptionPlaceholder')}
                        rows={3}
                        disabled={updating}
                      />
                    </>
                  )}

                  {/* Edit mode: type select */}
                  {isEditMode && (
                    <>
                      <div className="edit-section-label">
                        <Tag size={14} />
                        {t('professional.editAppointment.type')}
                      </div>
                      <select
                        className="modal-select"
                        value={editType}
                        onChange={(e) => setEditType(e.target.value)}
                        disabled={updating}
                      >
                        <option value="personal">{t('professional.appointments.types.personal')}</option>
                        <option value="split">{t('professional.appointments.types.split')}</option>
                        <option value="group">{t('professional.appointments.types.group')}</option>
                      </select>
                      <div className="type-suggestion">
                        {t('professional.editAppointment.suggestedType', {
                          type: renderAppointmentType(suggestedType),
                          count: confirmedClientCount,
                        })}
                      </div>
                      {typeValidationError && (
                        <div className="edit-validation-error">
                          <AlertCircle size={14} />
                          {typeValidationError}
                        </div>
                      )}
                    </>
                  )}

                  {/* Existing clients list */}
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

                  {/* Pending invite users section - always visible in details */}
                  {!isEditMode && (
                    <div className="detail-section">
                      <h3 className="detail-section-title">
                        <Clock size={16} /> {t('professional.appointments.pendingInviteUsers')} ({pendingInviteUsers.length})
                      </h3>
                      {pendingUsersLoading ? (
                        <div className="loading">{t('common.loading')}</div>
                      ) : pendingInviteUsers.length === 0 ? (
                        <p className="modal-subtitle">{t('professional.appointments.noPendingInviteUsers')}</p>
                      ) : (
                        <div className="clients-list">
                          {pendingInviteUsers.map((user) => (
                            <div key={user.id} className="client-item">
                              {user.first_name} {user.last_name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Invite users section - in details view (NOT edit mode, NOT personal type, only for confirmed appointments) */}
                  {!isEditMode && activeTab === 'confirmed' && appointmentDetails.type !== 'personal' && (
                    <div className="detail-section">
                      <h3 className="detail-section-title">
                        <UserPlus size={16} /> {t('professional.editAppointment.inviteUsers')}
                      </h3>
                      {missingUsersLoading ? (
                        <div className="loading">{t('professional.editAppointment.loadingMissingUsers')}</div>
                      ) : missingInviteUsers.length === 0 ? (
                        <p className="modal-subtitle">{t('professional.editAppointment.noMissingUsers')}</p>
                      ) : (
                        <>
                          <div className="modal-clients-selector">
                            {missingInviteUsers.map((user) => (
                              <label key={user.id} className="modal-checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={selectedInviteUsers.has(user.id)}
                                  onChange={(e) => handleInviteUserToggle(user.id, e.target.checked)}
                                  disabled={inviting}
                                />
                                <span>{user.first_name} {user.last_name}</span>
                              </label>
                            ))}
                          </div>
                          {selectedInviteUsers.size > 0 && (
                            <button
                              className="btn btn-invite"
                              onClick={handleSendInvite}
                              disabled={inviting}
                            >
                              {inviting ? (
                                <><Loader2 size={16} className="spinner" /> {t('professional.editAppointment.sendingInvite')}</>
                              ) : (
                                <><Send size={16} /> {t('professional.editAppointment.sendInvite')} ({selectedInviteUsers.size})</>
                              )}
                            </button>
                          )}
                        </>
                      )}
                      {inviteError && <div className="error-message">{inviteError}</div>}
                    </div>
                  )}
                </div>
              ) : (
                <div className="error-message">{t('common.appointmentClosed')}</div>
              )}

              {updateError && <div className="error-message">{updateError}</div>}
              {confirmError && <div className="error-message">{confirmError}</div>}
              
              <div className="modal-actions">
                {appointmentDetails ? (
                  isEditMode ? (
                    <>
                      <button
                        className="btn btn-secondary"
                        onClick={handleCancelEdit}
                        disabled={updating}
                      >
                        {t('professional.editAppointment.cancelEdit')}
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={handleSaveEdit}
                        disabled={updating || !!typeValidationError}
                      >
                        {updating ? t('professional.editAppointment.saving') : t('professional.editAppointment.saveButton')}
                      </button>
                    </>
                  ) : (
                    <>
                      {activeTab === 'pending' && (
                        <button
                          className="btn btn-primary"
                          onClick={handleConfirmFromDetails}
                          disabled={confirming}
                        >
                          {confirming ? t('common.creating') : t('common.confirm')}
                        </button>
                      )}
                      {activeTab === 'confirmed' && (
                        <button
                          className="btn btn-primary"
                          onClick={handleEnterEditMode}
                        >
                          <Edit2 size={14} />
                          {t('professional.editAppointment.editButton')}
                        </button>
                      )}
                      <button
                        className="btn btn-danger"
                        onClick={handleCancelFromDetails}
                        disabled={canceling || confirming}
                      >
                        {t('common.cancelAppointment')}
                      </button>
                    </>
                  )
                ) : null}
                {!isEditMode && (
                  <button
                    className="btn btn-secondary"
                    onClick={handleDetailsClose}
                    disabled={canceling || confirming}
                  >
                    {t('common.close')}
                  </button>
                )}
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
