import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { UserPlus, UserMinus, Users, Star, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react'
import { useProfessionals } from '../hooks/useProfessionals'
import { useMySubscriptions } from '../hooks/useMySubscriptions'
import './Professionals.css'

type Tab = 'all' | 'subscriptions'

export default function Professionals() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<Tab>('all')

  const allProfessionals = useProfessionals(15, activeTab === 'all')
  const mySubscriptions = useMySubscriptions(15, activeTab === 'subscriptions')

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    if (tab === 'all') {
      allProfessionals.setPage(1)
    } else {
      mySubscriptions.setPage(1)
    }
  }

  const renderAllProfessionals = () => {
    if (allProfessionals.loading) {
      return (
        <div className="coaches-status">
          <Loader2 size={32} className="spinner" />
          <p>{t('client.professionals.all.loading')}</p>
        </div>
      )
    }

    if (allProfessionals.error) {
      return (
        <div className="coaches-status coaches-error">
          <AlertCircle size={32} />
          <p>{allProfessionals.error}</p>
          <button className="btn btn-primary" onClick={allProfessionals.refetch}>
            {t('common.tryAgain')}
          </button>
        </div>
      )
    }

    if (allProfessionals.professionals.length === 0) {
      return (
        <div className="coaches-status">
          <Users size={40} className="empty-icon" />
          <p>{t('client.professionals.all.noProfessionals')}</p>
        </div>
      )
    }

    return (
      <>
        <div className="coaches-list">
          {allProfessionals.professionals.map((prof) => (
            <div key={prof.id} className="coach-card">
              <div className="coach-avatar">
                {prof.first_name?.[0]}{prof.last_name?.[0]}
              </div>
              <div className="coach-info">
                <span className="coach-name">{prof.first_name} {prof.last_name}</span>
              </div>
              <button
                className="btn btn-subscribe"
                onClick={async () => {
                  await allProfessionals.handleSubscribe(prof.id)
                }}
                disabled={allProfessionals.subscribingIds.has(prof.id)}
              >
                {allProfessionals.subscribingIds.has(prof.id)
                  ? <><Loader2 size={16} className="spinner" /> {t('client.professionals.all.subscribing')}</>
                  : <><UserPlus size={16} /> {t('client.professionals.all.subscribe')}</>}
              </button>
            </div>
          ))}
        </div>
        {allProfessionals.pagination && allProfessionals.pagination.has_next_page && (
          <div className="coaches-pagination">
            <button
              className="btn btn-pagination"
              disabled={allProfessionals.page === 1}
              onClick={() => allProfessionals.setPage(allProfessionals.page - 1)}
            >
              <ChevronLeft size={18} />
            </button>
            <span className="page-indicator">
              {t('common.page')} {allProfessionals.pagination.page}
            </span>
            <button
              className="btn btn-pagination"
              disabled={!allProfessionals.pagination.has_next_page}
              onClick={() => allProfessionals.setPage(allProfessionals.page + 1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </>
    )
  }

  const renderMySubscriptions = () => {
    if (mySubscriptions.loading) {
      return (
        <div className="coaches-status">
          <Loader2 size={32} className="spinner" />
          <p>{t('client.professionals.subscriptions.loading')}</p>
        </div>
      )
    }

    if (mySubscriptions.error) {
      return (
        <div className="coaches-status coaches-error">
          <AlertCircle size={32} />
          <p>{mySubscriptions.error}</p>
          <button className="btn btn-primary" onClick={mySubscriptions.refetch}>
            {t('common.tryAgain')}
          </button>
        </div>
      )
    }

    if (mySubscriptions.professionals.length === 0) {
      return (
        <div className="coaches-status">
          <Star size={40} className="empty-icon" />
          <p>{t('client.professionals.subscriptions.noSubscriptions')}</p>
        </div>
      )
    }

    return (
      <>
        <div className="coaches-list">
          {mySubscriptions.professionals.map((prof) => (
            <div key={prof.id} className="coach-card subscribed">
              <div className="coach-avatar subscribed">
                {prof.first_name?.[0]}{prof.last_name?.[0]}
              </div>
              <div className="coach-info">
                <span className="coach-name">{prof.first_name} {prof.last_name}</span>
              </div>
              <button
                className="btn btn-unsubscribe"
                onClick={() => mySubscriptions.handleUnsubscribe(prof.id)}
                disabled={mySubscriptions.unsubscribingIds.has(prof.id)}
              >
                {mySubscriptions.unsubscribingIds.has(prof.id)
                  ? <><Loader2 size={16} className="spinner" /> {t('client.professionals.subscriptions.unsubscribing')}</>
                  : <><UserMinus size={16} /> {t('client.professionals.subscriptions.unsubscribe')}</>}
              </button>
            </div>
          ))}
        </div>
        {mySubscriptions.pagination && mySubscriptions.pagination.has_next_page && (
          <div className="coaches-pagination">
            <button
              className="btn btn-pagination"
              disabled={mySubscriptions.page === 1}
              onClick={() => mySubscriptions.setPage(mySubscriptions.page - 1)}
            >
              <ChevronLeft size={18} />
            </button>
            <span className="page-indicator">
              {t('common.page')} {mySubscriptions.pagination.page}
            </span>
            <button
              className="btn btn-pagination"
              disabled={!mySubscriptions.pagination.has_next_page}
              onClick={() => mySubscriptions.setPage(mySubscriptions.page + 1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="coaches-container">
      <div className="coaches-wrapper">
        <header className="coaches-header">
          <h1>{t('client.professionals.title')}</h1>
        </header>

        <div className="coaches-tabs">
          <button
            className={`coaches-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => handleTabChange('all')}
          >
            <Users size={18} />
            {t('client.professionals.tabs.all')}
          </button>
          <button
            className={`coaches-tab ${activeTab === 'subscriptions' ? 'active' : ''}`}
            onClick={() => handleTabChange('subscriptions')}
          >
            <Star size={18} />
            {t('client.professionals.tabs.subscriptions')}
          </button>
        </div>

        <div className="coaches-content">
          {activeTab === 'all' ? renderAllProfessionals() : renderMySubscriptions()}
        </div>
      </div>
    </div>
  )
}
