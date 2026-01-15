import React from 'react'
import { HashRouter } from 'react-router-dom'
import AppRouter from './routes/AppRouter'
import './App.css'

function App() {
  return (
    <HashRouter>
      <AppRouter />
    </HashRouter>
  )
}

export default App
