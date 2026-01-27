import React from 'react'
import { useTranslation } from 'react-i18next'
import './Loading.css'

export default function LoadingRoute() {
  const { t } = useTranslation()

  return (
    <div className="container">
      <div className="loading-screen">
        <div className="spinner"></div>
        <div className="loading-text">{t('common.loading')}</div>
      </div>
    </div>
  )
}
