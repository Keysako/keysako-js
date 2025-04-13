import { useState, useEffect } from 'react'
import { KeysakoButton } from '@keysako-identity/react'
import { AuthResult, AuthError } from '@keysako-identity/core'
import './App.css'

function App() {
  const [authResult, setAuthResult] = useState<AuthResult | null>(null);
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const [serverUri, setServerUri] = useState<string>('');
  
  const redirectUri = `${window.location.origin}/auth/callback`;
  const clientId = "demo";
  
  // Display environment variable for debugging
  useEffect(() => {
    // Expose environment variables to the global window
    if (typeof window !== 'undefined') {
      // @ts-expect-error - Adding custom property to window object
      window.ENV_KEYSAKO_IDENTITY_SERVER_URI = import.meta.env.VITE_KEYSAKO_IDENTITY_SERVER_URI;
    }

    // Set server URI from environment variables
    setServerUri(import.meta.env.VITE_KEYSAKO_IDENTITY_SERVER_URI || 'Not configured');
    console.log('VITE_KEYSAKO_IDENTITY_SERVER_URI:', import.meta.env.VITE_KEYSAKO_IDENTITY_SERVER_URI);
  }, []);
  
  // Event handlers for authentication
  const handleSuccess = (result: AuthResult) => {
    console.log('Authentication successful:', result);
    setAuthResult(result);
    setAuthError(null);
  };

  const handleError = (error: AuthError) => {
    console.error('Authentication failed:', error);
    setAuthError(error);
    setAuthResult(null);
  };
  
  return (
    <div className="container">
      <header>
        <h1>Keysako Identity - React Example</h1>
        <p>Server URI: {serverUri}</p>
      </header>

      {/* Authentication results display section */}
      {(authResult || authError) && (
        <div className="auth-result-container">
          {authResult && (
            <div className="auth-result">
              <h2>Authentication Result</h2>
              <div className="result-details">
                <p><strong>Success:</strong> {authResult.success ? 'Yes' : 'No'}</p>
                {authResult.hasRequiredAge !== undefined && (
                  <p><strong>Age Verification:</strong> {authResult.hasRequiredAge ? 'Passed' : 'Failed'}</p>
                )}
                {authResult.token && (
                  <div>
                    <p><strong>Token:</strong></p>
                    <div className="token-display">
                      {authResult.token.substring(0, 20)}...
                    </div>
                  </div>
                )}
                {authResult.error && (
                  <p><strong>Error:</strong> {authResult.error}</p>
                )}
              </div>
            </div>
          )}

          {authError && (
            <div className="auth-error">
              <h2>Authentication Error</h2>
              <div className="error-details">
                <p><strong>Message:</strong> {authError.error}</p>
                {authError.details && (
                  <p><strong>Details:</strong> {JSON.stringify(authError.details)}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="buttons-container">
        <div className="button-row">
          <h2>Standard Buttons</h2>
          <KeysakoButton 
            clientId={clientId} 
            redirectUri={redirectUri}
            theme="light" 
            onSuccess={handleSuccess}
            onError={handleError}
          />
          <KeysakoButton 
            clientId={clientId} 
            redirectUri={redirectUri}
            theme="dark" 
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>
        
        <div className="button-row">
          <h2>Age Verified Buttons</h2>
          <KeysakoButton 
            clientId={clientId} 
            redirectUri={redirectUri}
            theme="light" 
            age={18} 
            onSuccess={handleSuccess}
            onError={handleError}
          />
          <KeysakoButton 
            clientId={clientId} 
            redirectUri={redirectUri}
            theme="dark" 
            age={18} 
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>
      
        <div className="button-row">
          <h2>Popup Buttons</h2>
          <KeysakoButton 
            clientId={clientId} 
            redirectUri={redirectUri}
            theme="light" 
            usePopup 
            onSuccess={handleSuccess}
            onError={handleError}
          />
          <KeysakoButton 
            clientId={clientId} 
            redirectUri={redirectUri}
            theme="dark" 
            usePopup 
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>
        
        <div className="button-row">
          <h2>Logo Only Buttons</h2>
          <KeysakoButton 
            clientId={clientId} 
            redirectUri={redirectUri}
            theme="light" 
            logoOnly 
            onSuccess={handleSuccess}
            onError={handleError}
          />
          <KeysakoButton 
            clientId={clientId} 
            redirectUri={redirectUri}
            theme="dark" 
            logoOnly 
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>
      </div>
    </div>
  )
}

export default App
