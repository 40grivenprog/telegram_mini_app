import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProfessionals } from '../hooks/useProfessionals'
import { useMySubscriptions } from '../hooks/useMySubscriptions'
import './Professionals.css'

interface ProfessionalsProps {
  onBack: () => void
}

type Tab = 'all' | 'subscriptions'

export default function Professionals({ onBack }: ProfessionalsProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<Tab>('all')
  
  const allProfessionals = useProfessionals(15, activeTab === 'all')
  const mySubscriptions = useMySubscriptions(15, activeTab === 'subscriptions')

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    // Reset pagination when switching tabs
    if (tab === 'all') {
      allProfessionals.setPage(1)
    } else {
      mySubscriptions.setPage(1)
    }
  }

  const renderAllProfessionals = () => {
    if (allProfessionals.loading) {
      return (
        <div className="loading-screen">
          <div className="loading">{t('client.professionals.all.loading')}</div>
        </div>
      )
    }

    if (allProfessionals.error) {
      return (
        <div className="error-screen">
          <div className="error-message">{allProfessionals.error}</div>
          <button className="btn btn-primary" onClick={allProfessionals.refetch}>
            {t('common.tryAgain')}
          </button>
        </div>
      )
    }

    if (allProfessionals.professionals.length === 0) {
      return (
        <div className="no-professionals">
          <p>{t('client.professionals.all.noProfessionals')}</p>
        </div>
      )
    }

    return (
      <>
        <div className="professionals-list">
          {allProfessionals.professionals.map((prof) => (
            <div key={prof.id} className="professional-card">
              <div className="professional-info">
                <div className="professional-name">
                  👨‍💼 {prof.first_name} {prof.last_name}
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={async () => {
                  await allProfessionals.handleSubscribe(prof.id)
                  // Refresh subscriptions list when user switches to subscriptions tab
                  // The list will be loaded automatically when tab becomes active
                }}
                disabled={allProfessionals.subscribingIds.has(prof.id)}
              >
                {allProfessionals.subscribingIds.has(prof.id) 
                  ? t('client.professionals.all.subscribing') 
                  : t('client.professionals.all.subscribe')}
              </button>
            </div>
          ))}
        </div>
        {allProfessionals.pagination && (
          <div className="pagination">
            <button
              className="btn btn-secondary"
              disabled={allProfessionals.page === 1}
              onClick={() => allProfessionals.setPage(allProfessionals.page - 1)}
            >
              {t('common.previous')}
            </button>
            <span className="page-info">
              {t('common.page')} {allProfessionals.pagination.page}
            </span>
            <button
              className="btn btn-secondary"
              disabled={!allProfessionals.pagination.has_next_page}
              onClick={() => allProfessionals.setPage(allProfessionals.page + 1)}
            >
              {t('common.next')}
            </button>
          </div>
        )}
      </>
    )
  }

  const renderMySubscriptions = () => {
    if (mySubscriptions.loading) {
      return (
        <div className="loading-screen">
          <div className="loading">{t('client.professionals.subscriptions.loading')}</div>
        </div>
      )
    }

    if (mySubscriptions.error) {
      return (
        <div className="error-screen">
          <div className="error-message">{mySubscriptions.error}</div>
          <button className="btn btn-primary" onClick={mySubscriptions.refetch}>
            {t('common.tryAgain')}
          </button>
        </div>
      )
    }

    if (mySubscriptions.professionals.length === 0) {
      return (
        <div className="no-subscriptions">
          <p>{t('client.professionals.subscriptions.noSubscriptions')}</p>
        </div>
      )
    }

    return (
      <>
        <div className="subscriptions-list">
          {mySubscriptions.professionals.map((prof) => (
            <div key={prof.id} className="subscription-card">
              <div className="professional-info">
                <div className="professional-name">
                  ⭐ 👨‍💼 {prof.first_name} {prof.last_name}
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => mySubscriptions.handleUnsubscribe(prof.id)}
                disabled={mySubscriptions.unsubscribingIds.has(prof.id)}
              >
                {mySubscriptions.unsubscribingIds.has(prof.id) 
                  ? t('client.professionals.subscriptions.unsubscribing') 
                  : t('client.professionals.subscriptions.unsubscribe')}
              </button>
            </div>
          ))}
        </div>
        {mySubscriptions.pagination && (
          <div className="pagination">
            <button
              className="btn btn-secondary"
              disabled={mySubscriptions.page === 1}
              onClick={() => mySubscriptions.setPage(mySubscriptions.page - 1)}
            >
              {t('common.previous')}
            </button>
            <span className="page-info">
              {t('common.page')} {mySubscriptions.pagination.page}
            </span>
            <button
              className="btn btn-secondary"
              disabled={!mySubscriptions.pagination.has_next_page}
              onClick={() => mySubscriptions.setPage(mySubscriptions.page + 1)}
            >
              {t('common.next')}
            </button>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="container">
      <header className="header">
        <h1>{t('client.professionals.title')}</h1>
      </header>
      <div className="content">
        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => handleTabChange('all')}
          >
            {t('client.professionals.tabs.all')}
          </button>
          <button
            className={`tab ${activeTab === 'subscriptions' ? 'active' : ''}`}
            onClick={() => handleTabChange('subscriptions')}
          >
            {t('client.professionals.tabs.subscriptions')}
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'all' ? renderAllProfessionals() : renderMySubscriptions()}
        </div>

        <button className="btn btn-secondary" onClick={onBack}>
          {t('common.back')}
        </button>
      </div>
    </div>
  )
}
