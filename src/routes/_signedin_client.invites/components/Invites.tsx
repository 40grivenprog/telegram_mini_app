import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Mail, Loader2, AlertCircle, User, Calendar, Clock, FileText, CheckCircle, X, Check } from 'lucide-react'
import { useClientInvites, ClientInvite } from '../hooks/useClientInvites'
import { apiService } from '../../../services/api'
import { formatDate, formatTime } from '../../../utils/i18n'
import { removeInviteParamFromURL } from '../../../utils/urlParams'
import './Invites.css'

interface InvitesProps {
  onBack: () => void
  initialInviteID?: string | null
}

export default function Invites({ onBack, initialInviteID }: InvitesProps) {
  const { t } = useTranslation()
  const { invites, loading, error, refetch } = useClientInvites()
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedInvite, setSelectedInvite] = useState<ClientInvite | null>(null)
  const [processing, setProcessing] = useState(false)
  const [loadingInvite, setLoadingInvite] = useState(false)
  const paramRemovedRef = useRef(false)
  
  const handleInviteClick = (invite: ClientInvite) => {
    setSelectedInvite(invite)
    setDetailsModalOpen(true)
  }

  const handleDetailsClose = () => {
    setDetailsModalOpen(false)
    setSelectedInvite(null)
  }

  const handleConfirm = async () => {
    if (!selectedInvite) return
    
    setProcessing(true)
    try {
      await apiService.acceptClientInvite(
        selectedInvite.id,
        selectedInvite.appointment_id,
        selectedInvite.type
      )
      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.showAlert(t('client.invites.inviteAccepted'))
        tg.HapticFeedback.notificationOccurred('success')
      }
      setDetailsModalOpen(false)
      setSelectedInvite(null)
      await refetch()
    } catch (err: any) {
      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.showAlert(err.message || t('client.invites.acceptError'))
        tg.HapticFeedback.notificationOccurred('error')
      }
    } finally {
      setProcessing(false)
    }
  }

  const handleDismiss = async () => {
    if (!selectedInvite) return
    
    setProcessing(true)
    try {
      await apiService.deleteClientInvite(selectedInvite.id)
      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.showAlert(t('client.invites.inviteDismissed'))
        tg.HapticFeedback.notificationOccurred('success')
      }
      setDetailsModalOpen(false)
      setSelectedInvite(null)
      await refetch()
    } catch (err: any) {
      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.showAlert(err.message || t('client.invites.dismissError'))
        tg.HapticFeedback.notificationOccurred('error')
      }
    } finally {
      setProcessing(false)
    }
  }

  const handleCancel = () => {
    setDetailsModalOpen(false)
    setSelectedInvite(null)
  }

  // Remove invite parameter from URL (deep link cleanup)
  useEffect(() => {
    if (initialInviteID && !paramRemovedRef.current) {
      removeInviteParamFromURL()
      paramRemovedRef.current = true
    }
  }, [initialInviteID])

  // Open invite details if initialInviteID is provided
  useEffect(() => {
    if (initialInviteID && !detailsModalOpen && !loadingInvite) {
      const openInviteDetails = async () => {
        setLoadingInvite(true)
        try {
          const inviteData = await apiService.getClientInvite(initialInviteID)
          // Map the response to ClientInvite format
          const invite: ClientInvite = {
            id: inviteData.id,
            appointment_id: inviteData.appointment_id,
            start_time: inviteData.start_time,
            end_time: inviteData.end_time,
            description: inviteData.description || '',
            type: inviteData.type,
            professional_name: inviteData.professional_name,
            client_id: '', // Not in response, but not needed for display
          }
          setSelectedInvite(invite)
          setDetailsModalOpen(true)
        } catch (err: any) {
          // If invite not found (404), show localized message
          const tg = (window as any).Telegram?.WebApp
          if (tg) {
            if (err.status === 404) {
              tg.showAlert(t('client.invites.inviteAlreadyConfirmedOrUnavailable'))
            } else {
              tg.showAlert(err.message || t('client.invites.acceptError'))
            }
            tg.HapticFeedback.notificationOccurred('error')
          }
        } finally {
          setLoadingInvite(false)
        }
      }
      // Wait a bit for invites to load first
      const timer = setTimeout(() => {
        openInviteDetails()
      }, 500)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialInviteID])

  const getTypeDisplay = (type: string) => {
    switch (type) {
      case 'split':
        return t('client.invites.typeSplit')
      case 'group':
        return t('client.invites.typeGroup')
      case 'personal':
        return t('client.invites.typePersonal')
      default:
        return type
    }
  }

  const getTypeDisplaySingle = (type: string) => {
    switch (type) {
      case 'split':
        return t('client.invites.typeSplitSingle')
      case 'group':
        return t('client.invites.typeGroupSingle')
    }
  }

  if (loading) {
    return (
      <div className="invites-container">
        <div className="invites-wrapper">
          <div className="invites-status">
            <Loader2 size={32} className="spinner" />
            <p>{t('common.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="invites-container">
      <div className="invites-wrapper">
        <header className="invites-header">
          <h1>{t('client.invites.title')}</h1>
        </header>

        <div className="invites-content">
          {error && (
            <div className="invites-status invites-error">
              <AlertCircle size={32} />
              <p>{error}</p>
            </div>
          )}
          
          {!error && invites.length === 0 ? (
            <div className="invites-status">
              <Mail size={40} className="empty-icon" />
              <p>{t('client.invites.noInvites')}</p>
            </div>
          ) : (
            <div className="invites-list">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="invite-card"
                  onClick={() => handleInviteClick(invite)}
                >
                  <div className="invite-card-content">
                    <div className="invite-header">
                      <span className="invite-badge">
                        <Mail size={14} />
                        {t('client.invites.newInvite')}
                      </span>
                    </div>
                    <div className="invite-info">
                      <p className="invite-text">
                        {t('client.invites.invitedYou', { 
                          professionalName: invite.professional_name,
                          typeDisplay: getTypeDisplay(invite.type)
                        })}
                      </p>
                      <div className="invite-time">
                        <Calendar size={14} />
                        {formatDate(new Date(invite.start_time), { year: 'numeric', month: 'long', day: 'numeric' })} <Clock size={14} />
                        {formatTime(new Date(invite.start_time))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {detailsModalOpen && selectedInvite && (
        <div className="modal-overlay" onClick={handleDetailsClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('client.invites.inviteDetails')}</h2>
            </div>
            <div className="modal-body">
              <div className="booking-summary">
                <div className="summary-row">
                  <User size={16} />
                  <span className="summary-label">{t('common.coach')}</span>
                  <span className="summary-value filled">
                    <Check size={14} className="check-icon" /> {selectedInvite.professional_name}
                  </span>
                </div>
                <div className="summary-row">
                  <FileText size={16} />
                  <span className="summary-label">{t('client.invites.type')}</span>
                  <span className="summary-value filled">
                    <Check size={14} className="check-icon" /> {getTypeDisplay(selectedInvite.type)}
                  </span>
                </div>
                <div className="summary-row">
                  <Calendar size={16} />
                  <span className="summary-label">{t('common.date')}</span>
                  <span className="summary-value filled">
                    <Check size={14} className="check-icon" /> {formatDate(new Date(selectedInvite.start_time), { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div className="summary-row">
                  <Clock size={16} />
                  <span className="summary-label">{t('client.invites.startTime')}</span>
                  <span className="summary-value filled">
                    <Check size={14} className="check-icon" /> {formatTime(new Date(selectedInvite.start_time))}
                  </span>
                </div>
                <div className="summary-row">
                  <Clock size={16} />
                  <span className="summary-label">{t('client.invites.endTime')}</span>
                  <span className="summary-value filled">
                    <Check size={14} className="check-icon" /> {formatTime(new Date(selectedInvite.end_time))}
                  </span>
                </div>
                {selectedInvite.description && (
                  <div className="summary-row">
                    <FileText size={16} />
                    <span className="summary-label">{t('common.description')}</span>
                    <span className="summary-value filled">
                      <Check size={14} className="check-icon" /> {selectedInvite.description}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={handleConfirm}
                disabled={processing}
              >
                {processing ? <><Loader2 size={16} className="spinner" /> {t('common.loading')}</> : <><CheckCircle size={16} /> {t('common.confirm')}</>}
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDismiss}
                disabled={processing}
              >
                <X size={16} /> {t('client.invites.dismiss')}
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={processing}
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
