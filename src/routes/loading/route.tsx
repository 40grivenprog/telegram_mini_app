import React from 'react'
import './Loading.css'

export default function LoadingRoute() {
  return (
    <div className="container">
      <div className="loading-screen">
        <div className="spinner"></div>
        <div className="loading-text">Загрузка...</div>
      </div>
    </div>
  )
}
