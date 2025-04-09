import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Exposer les variables d'environnement à la fenêtre globale
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.ENV_KEYSAKO_IDENTITY_SERVER_URI = import.meta.env.VITE_KEYSAKO_IDENTITY_SERVER_URI;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
