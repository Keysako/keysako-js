import { AuthResult, AuthError } from '@keysako/core';
import { KeysakoButton } from '@keysako/react';
import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [authResult, setAuthResult] = useState<AuthResult | null>(null);
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const [serverUri, setServerUri] = useState<string>('');

  const redirectUri = `${window.location.origin}/auth/callback`;
  const clientId = 'demo';

  // Display environment variable for debugging
  useEffect(() => {
    // Expose environment variables to the global window
    if (typeof window !== 'undefined') {
      // @ts-expect-error - Adding custom property to window object
      window.ENV_KEYSAKO_IDENTITY_SERVER_URI = import.meta.env.VITE_KEYSAKO_IDENTITY_SERVER_URI;
    }

    // Set server URI from environment variables
    setServerUri(import.meta.env.VITE_KEYSAKO_IDENTITY_SERVER_URI || 'Not configured');
    console.log(
      'VITE_KEYSAKO_IDENTITY_SERVER_URI:',
      import.meta.env.VITE_KEYSAKO_IDENTITY_SERVER_URI
    );
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
              <h2>🔐 Authentication Result</h2>
              <div className="result-details">
                {/* Core Status */}
                <div className="status-overview">
                  <div className="status-card">
                    <span className="status-icon">{authResult.success ? '✅' : '❌'}</span>
                    <div>
                      <strong>Authentication</strong>
                      <div className="status-text">{authResult.success ? 'Success' : 'Failed'}</div>
                    </div>
                  </div>
                  <div className="status-card">
                    <span className="status-icon">{authResult.isAuthorized ? '🟢' : '🟡'}</span>
                    <div>
                      <strong>Authorization</strong>
                      <div className="status-text">
                        {authResult.isAuthorized ? 'Authorized' : 'Restricted'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Properties */}
                <div className="result-grid">
                  <div className="result-item">
                    <strong>Success:</strong>
                    <span className={`status ${authResult.success ? 'success' : 'error'}`}>
                      {authResult.success ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>

                  <div className="result-item">
                    <strong>Is Authorized:</strong>
                    <span className={`status ${authResult.isAuthorized ? 'success' : 'warning'}`}>
                      {authResult.isAuthorized ? '✓ Yes' : '⚠ No'}
                    </span>
                  </div>

                  <div className="result-item">
                    <strong>Has Identity:</strong>
                    <span className={`status ${authResult.hasIdentity ? 'success' : 'warning'}`}>
                      {authResult.hasIdentity ? '✓ Yes' : '⚠ No'}
                    </span>
                  </div>

                  <div className="result-item">
                    <strong>Has Required Age:</strong>
                    <span className={`status ${authResult.hasRequiredAge ? 'success' : 'warning'}`}>
                      {authResult.hasRequiredAge ? '✓ Yes' : '⚠ No'}
                    </span>
                  </div>

                  {authResult.requiredAge && (
                    <div className="result-item">
                      <strong>Required Age:</strong>
                      <span className="age-value">{authResult.requiredAge}</span>
                    </div>
                  )}

                  <div className="result-item">
                    <strong>Country Allowed:</strong>
                    <span className={`status ${authResult.isCountryAllowed ? 'success' : 'error'}`}>
                      {authResult.isCountryAllowed ? '✓ Yes' : '✗ No'}
                    </span>
                  </div>

                  {authResult.countryCode && (
                    <div className="result-item">
                      <strong>Country Code:</strong>
                      <span className="country-code">{authResult.countryCode}</span>
                    </div>
                  )}

                  {authResult.expiresAt && (
                    <div className="result-item">
                      <strong>Expires At:</strong>
                      <div className="expires-info">
                        <span className="expires-at">
                          {(() => {
                            // Handle both Unix timestamp (seconds) and ISO string
                            const expValue = authResult.expiresAt;
                            if (typeof expValue === 'string' && expValue.includes('T')) {
                              // ISO string format
                              return new Date(expValue).toLocaleString();
                            } else {
                              // Unix timestamp (seconds) - convert to milliseconds
                              const timestamp = parseInt(expValue as string) * 1000;
                              return new Date(timestamp).toLocaleString();
                            }
                          })()}
                        </span>
                        <small className="expires-raw">
                          Raw: {authResult.expiresAt}
                          {!authResult.expiresAt.includes('T') && ' (Unix timestamp)'}
                        </small>
                      </div>
                    </div>
                  )}
                </div>

                {authResult.token && (
                  <div className="token-section">
                    <h3>🔑 Access Token</h3>
                    <div className="token-display">
                      <code>{authResult.token.substring(0, 50)}...</code>
                      <button
                        className="copy-button"
                        onClick={() => navigator.clipboard.writeText(authResult.token || '')}
                        title="Copy token to clipboard"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                )}

                {authResult.error && (
                  <div className="error-section">
                    <h3>❌ Error Details</h3>
                    <div className="error-message">{authResult.error}</div>
                  </div>
                )}

                {/* Raw JSON for developers */}
                <div className="json-section">
                  <h3>🔍 Raw AuthResult Object</h3>
                  <div className="json-display">
                    <pre>
                      <code>{JSON.stringify(authResult, null, 2)}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {authError && (
            <div className="auth-error">
              <h2>Authentication Error</h2>
              <div className="error-details">
                <p>
                  <strong>Message:</strong> {authError.error}
                </p>
                {authError.details && (
                  <p>
                    <strong>Details:</strong> {JSON.stringify(authError.details)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="buttons-container">
        <div className="button-row">
          <h2>Standard Buttons (2 buttons expected)</h2>
          <KeysakoButton
            key="standard-light"
            clientId={clientId}
            redirectUri={redirectUri}
            theme="light"
            onSuccess={handleSuccess}
            onError={handleError}
          />
          <KeysakoButton
            key="standard-dark"
            clientId={clientId}
            redirectUri={redirectUri}
            theme="dark"
            onSuccess={handleSuccess}
            onError={handleError}
          />
          <KeysakoButton
            key="standard-default"
            clientId={clientId}
            redirectUri={redirectUri}
            theme="default"
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>

        <div className="button-row">
          <h2>Age Verified Buttons (2 buttons expected)</h2>
          <KeysakoButton
            key="age-light"
            clientId={clientId}
            redirectUri={redirectUri}
            theme="light"
            shape="sharp"
            age={18}
            onSuccess={handleSuccess}
            onError={handleError}
          />
          <KeysakoButton
            key="age-dark"
            clientId={clientId}
            redirectUri={redirectUri}
            theme="dark"
            shape="sharp"
            age={18}
            onSuccess={handleSuccess}
            onError={handleError}
          />
          <KeysakoButton
            key="age-default"
            clientId={clientId}
            redirectUri={redirectUri}
            locale="vi-VN"
            theme="default"
            shape="rounded"
            age={18}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>

        <div className="button-row">
          <h2>Logo Only Buttons (2 buttons expected)</h2>
          <KeysakoButton
            key="logo-light"
            clientId={clientId}
            redirectUri={redirectUri}
            theme="light"
            logoOnly
            onSuccess={handleSuccess}
            onError={handleError}
          />
          <KeysakoButton
            key="logo-dark"
            clientId={clientId}
            redirectUri={redirectUri}
            theme="dark"
            logoOnly
            onSuccess={handleSuccess}
            onError={handleError}
          />
          <KeysakoButton
            key="logo-default"
            clientId={clientId}
            redirectUri={redirectUri}
            theme="default"
            logoOnly
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
