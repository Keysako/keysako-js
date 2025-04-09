import React, { createContext, useContext, useEffect, useState } from 'react';
import { IdentityProvider, TokenManager, AuthResult } from '@keysako-identity/core';
import { KeysakoProviderProps } from './types';

/**
 * Context for Keysako authentication
 */
interface KeysakoContextType {
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => string | null;
  getIdToken: () => string | null;
}

// Create context with default values
const KeysakoContext = createContext<KeysakoContextType>({
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  getAccessToken: () => null,
  getIdToken: () => null
});

/**
 * Hook to use Keysako authentication in React components
 * @returns KeysakoContextType
 */
export const useKeysako = () => useContext(KeysakoContext);

/**
 * Provider component for Keysako authentication
 * @param props KeysakoProviderProps
 * @returns React component
 */
export const KeysakoProvider: React.FC<KeysakoProviderProps> = ({ 
  clientId, 
  redirectUri, 
  age, 
  usePopup = false, 
  children 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [provider, setProvider] = useState<IdentityProvider | null>(null);
  const [tokenManager, setTokenManager] = useState<TokenManager | null>(null);

  useEffect(() => {
    // Initialize the provider and token manager
    const tokenMgr = TokenManager.getInstance();
    setTokenManager(tokenMgr);
    
    const identityProvider = IdentityProvider.initialize({
      clientId,
      redirectUri,
      age,
      usePopup,
      onAuthComplete: (result: AuthResult) => {
        setIsAuthenticated(result.success);
      }
    });
    
    setProvider(identityProvider);
    
    // Check if user is already authenticated
    setIsAuthenticated(tokenMgr.hasValidAccessToken());
    
    // Listen for token events
    const handleTokensUpdated = () => {
      setIsAuthenticated(tokenMgr.hasValidAccessToken());
    };
    
    const handleTokensCleared = () => {
      setIsAuthenticated(false);
    };
    
    window.addEventListener('keysako:tokens_updated', handleTokensUpdated);
    window.addEventListener('keysako:tokens_cleared', handleTokensCleared);
    
    return () => {
      window.removeEventListener('keysako:tokens_updated', handleTokensUpdated);
      window.removeEventListener('keysako:tokens_cleared', handleTokensCleared);
    };
  }, [clientId, redirectUri, age, usePopup]);

  const login = async () => {
    if (provider) {
      await provider.login();
    }
  };

  const logout = async () => {
    if (provider) {
      await provider.logout();
    }
  };

  const getAccessToken = () => {
    return tokenManager ? tokenManager.getAccessToken() : null;
  };

  const getIdToken = () => {
    return tokenManager ? tokenManager.getIdToken() : null;
  };

  const contextValue: KeysakoContextType = {
    isAuthenticated,
    login,
    logout,
    getAccessToken,
    getIdToken
  };

  return (
    <KeysakoContext.Provider value={contextValue}>
      {children}
    </KeysakoContext.Provider>
  );
};
