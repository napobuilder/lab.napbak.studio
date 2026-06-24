import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import TusasongDashboard from './pages/TusasongDashboard.jsx'

const path = window.location.pathname;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {path === '/vip/tusasong' ? <TusasongDashboard /> : <App />}
  </StrictMode>,
)
