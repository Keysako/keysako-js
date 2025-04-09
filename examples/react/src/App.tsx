import { useState, useEffect } from 'react'
import { KeysakoProvider } from '@keysako-identity/react'
import { KeysakoButton } from '@keysako-identity/react'
import './App.css'

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Afficher la variable d'environnement pour le débogage
  useEffect(() => {
    console.log('VITE_KEYSAKO_IDENTITY_SERVER_URI:', import.meta.env.VITE_KEYSAKO_IDENTITY_SERVER_URI);
  }, []);
  
  return (
    <KeysakoProvider
      clientId="demo"
      redirectUri={window.location.origin}
    >
      <div className={`app ${theme}`}>
        <h1>Exemple Keysako avec React + Vite</h1>
        
        <div className="theme-toggle">
          <button 
            onClick={() => setTheme('light')} 
            className={theme === 'light' ? 'active' : ''}
          >
            Mode clair
          </button>
          <button 
            onClick={() => setTheme('dark')} 
            className={theme === 'dark' ? 'active' : ''}
          >
            Mode sombre
          </button>
        </div>

        <div className="button-container">
          <div className="button-example">
            <h2>Bouton standard</h2>
            <KeysakoButton 
              clientId="demo" 
              redirectUri={window.location.origin}
              theme={theme} 
            />
          </div>
          
          <div className="button-example">
            <h2>Bouton avec vérification d'âge (18+)</h2>
            <KeysakoButton 
              clientId="demo" 
              redirectUri={window.location.origin}
              theme={theme} 
              age={18} 
            />
          </div>
        </div>

        <div className="button-container">
          <div className="button-example">
            <h2>Bouton avec popup</h2>
            <KeysakoButton 
              clientId="demo" 
              redirectUri={window.location.origin}
              theme={theme} 
              usePopup 
            />
          </div>
          
          <div className="button-example">
            <h2>Bouton avec logo uniquement</h2>
            <KeysakoButton 
              clientId="demo" 
              redirectUri={window.location.origin}
              theme={theme} 
              logoOnly 
            />
          </div>
        </div>

        <div className="server-info">
          <h2>Informations de configuration</h2>
          <p>Serveur d'identité: {import.meta.env.VITE_KEYSAKO_IDENTITY_SERVER_URI || 'Non configuré'}</p>
        </div>
      </div>
    </KeysakoProvider>
  )
}

export default App
