import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import TusasongDashboard from './pages/TusasongDashboard.jsx'

const path = typeof window !== 'undefined' ? window.location.pathname : '/';
const rootElement = document.getElementById('root');

const element = (
  <StrictMode>
    {path === '/vip/tusasong' ? <TusasongDashboard /> : <App />}
  </StrictMode>
);

if (rootElement.hasChildNodes() && !rootElement.querySelector('#dsp-loader-placeholder')) {
  hydrateRoot(rootElement, element);
} else {
  createRoot(rootElement).render(element);
}

