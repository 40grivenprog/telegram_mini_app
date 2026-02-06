import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCreateGroupVisitAppointment, CreateGroupVisitAppointmentClient } from '../hooks/useCreateGroupVisitAppointment'
import { useProfessionalSubscriptions, ProfessionalSubscription } from '../hooks/useProfessionalSubscriptions'
import { formatDate, formatTime } from '../../../utils/i18n'
import './GroupVisitDescription.css'

interface GroupVisitDescriptionProps {
  professionalID: string
  date: string
  startTime: string
  endTime: string
  onConfirm: () => void
  onCancel: () => void
}

export default function GroupVisitDescription({
  professionalID,
  date,
  startTime,
  endTime,
  onConfirm,
  onCancel,
}: GroupVisitDescriptionProps) {
  const { t } = useTranslation()
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'split' | 'group'>('group')
  const [selectAll, setSelectAll] = useState(false)
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set())
  const { createGroupVisitAppointment, creating, error } = useCreateGroupVisitAppointment()
  const { subscriptions, loading: subscriptionsLoading, error: subscriptionsError } = useProfessionalSubscriptions()
  
  // Filter out subscriptions without chat_id
  const validSubscriptions = subscriptions.filter(s => s.chat_id !== null)

  const handleSelectAllChange = (checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      setSelectedClients(new Set())
    }
  }

  const handleClientChange = (subscriptionId: string, checked: boolean) => {
    if (checked) {
      setSelectedClients(prev => {
        const newSet = new Set(prev)
        newSet.add(subscriptionId)
        return newSet
      })
      setSelectAll(false)
    } else {
      setSelectedClients(prev => {
        const newSet = new Set(prev)
        newSet.delete(subscriptionId)
        return newSet
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!description.trim()) {
      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.showAlert(t('professional.createGroupVisit.description.descriptionRequired'))
      }
      return
    }

    if (!selectAll && selectedClients.size === 0) {
      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.showAlert(t('professional.createGroupVisit.description.selectClientsRequired'))
      }
      return
    }

    const clients: CreateGroupVisitAppointmentClient[] = selectAll
      ? []
      : Array.from(selectedClients)
          .map(id => {
            const subscription = validSubscriptions.find(s => s.id === id)
            if (!subscription) {
              return null
            }
            if (subscription.chat_id === null || subscription.chat_id === undefined) {
              return null
            }
            if (!subscription.locale || subscription.locale.trim() === '') {
              return null
            }
            return {
              id: subscription.id,
              chat_id: subscription.chat_id,
              locale: subscription.locale,
            }
          })
          .filter((client): client is CreateGroupVisitAppointmentClient => client !== null)

    try {
      await createGroupVisitAppointment({
        professional_id: professionalID,
        start_at: startTime,
        end_at: endTime,
        description: description.trim(),
        type,
        clients_selected: selectAll ? 'all' : 'partially_selected',
        clients,
      }, onConfirm)
    } catch {
      // Error is already handled by the hook
    }
  }

  return (
    <div className="container">
      <header className="header">
        <h1>{t('professional.createGroupVisit.description.title')}</h1>
      </header>
      <div className="content">
        {error && <div className="error-message">{error}</div>}
        
        <div className="group-visit-summary">
          <p><strong>📅 {t('professional.createGroupVisit.description.date')}:</strong> {formatDate(date)}</p>
          <p><strong>🕐 {t('professional.createGroupVisit.description.time')}:</strong> {formatTime(startTime)} - {formatTime(endTime)}</p>
        </div>

        <form onSubmit={handleSubmit} className="description-form">
          <div className="form-group">
            <label htmlFor="type" className="form-label">
              {t('professional.createGroupVisit.description.type')}
            </label>
            <select
              id="type"
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value as 'split' | 'group')}
              disabled={creating}
              required
            >
              <option value="group">{t('professional.createGroupVisit.description.typeGroup')}</option>
              <option value="split">{t('professional.createGroupVisit.description.typeSplit')}</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              {t('professional.createGroupVisit.description.clients')}
            </label>
            {subscriptionsLoading ? (
              <div className="loading-text">{t('common.loading')}</div>
            ) : subscriptionsError ? (
              <div className="error-text">{subscriptionsError}</div>
            ) : validSubscriptions.length === 0 ? (
              <div className="info-text">{t('professional.createGroupVisit.description.noSubscriptions')}</div>
            ) : (
              <div className="clients-selector">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={(e) => handleSelectAllChange(e.target.checked)}
                    disabled={creating}
                  />
                  <span>{t('professional.createGroupVisit.description.selectAll')}</span>
                </label>
                <div className="clients-list">
                  {validSubscriptions.map((subscription) => (
                    <label key={subscription.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={!selectAll && selectedClients.has(subscription.id)}
                        onChange={(e) => handleClientChange(subscription.id, e.target.checked)}
                        disabled={creating || selectAll}
                      />
                      <span>
                        {subscription.first_name} {subscription.last_name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              {t('professional.createGroupVisit.description.description')}
            </label>
            <textarea
              id="description"
              className="description-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('professional.createGroupVisit.description.descriptionPlaceholder')}
              rows={4}
              disabled={creating}
              required
            />
          </div>
          
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={creating || !description.trim() || (validSubscriptions.length > 0 && !selectAll && selectedClients.size === 0)}
            >
              {creating ? t('common.creating') : t('common.create')}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={creating}
            >
              {t('common.back')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
