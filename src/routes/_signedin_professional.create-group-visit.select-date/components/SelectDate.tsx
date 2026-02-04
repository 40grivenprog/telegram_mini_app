import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { generateAvailableDates } from '../../../utils/date'
import { formatDate } from '../../../utils/i18n'
import './SelectDate.css'

interface SelectDateProps {
  professionalID: string
  onSelect: (date: string) => void
  onCancel: () => void
}

export default function SelectDate({ professionalID, onSelect, onCancel }: SelectDateProps) {
  const { t } = useTranslation()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const dates = generateAvailableDates(currentMonth)
  const today = new Date()
  const isCurrentMonth = currentMonth.getMonth() === today.getMonth() && 
                         currentMonth.getFullYear() === today.getFullYear()

  return (
    <div className="container">
      <header className="header">
        <h1>{t('professional.createGroupVisit.selectDate.title')}</h1>
        <p className="subtitle">
          {formatDate(currentMonth, { month: 'long', year: 'numeric' })}
        </p>
      </header>
      <div className="content">
        <div className="dates-grid">
          {dates.map((date) => {
            const dateObj = new Date(date)
            const dayOfWeek = formatDate(dateObj, { weekday: 'short' })
            const day = dateObj.getDate()
            
            return (
              <button
                key={date}
                className="date-button"
                onClick={() => onSelect(date)}
              >
                <div className="date-day">{day}</div>
                <div className="date-weekday">{dayOfWeek}</div>
              </button>
            )
          })}
        </div>
        <div className="month-navigation">
          <button
            className="btn btn-secondary"
            disabled={isCurrentMonth}
            onClick={handlePrevMonth}
          >
            {t('common.previousMonth')}
          </button>
          <button className="btn btn-secondary" onClick={handleNextMonth}>
            {t('common.nextMonth')}
          </button>
        </div>
        <button className="btn btn-secondary" onClick={onCancel}>
          {t('common.cancel')}
        </button>
      </div>
    </div>
  )
}
