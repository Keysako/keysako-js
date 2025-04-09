import { TokenManager } from '@keysako-identity/core';
import React, { useEffect, useState } from 'react';

import { KeysakoProviderProps } from './types';

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
  children,
}) => {
  const [tokenManager, setTokenManager] = useState<TokenManager | null>(null);

  useEffect(() => {
    // Initialize the token manager
    const tokenMgr = TokenManager.getInstance();
    setTokenManager(tokenMgr);

    // Listen for token events
    const handleTokensUpdated = () => {
      // Event handler for token updates
    };

    const handleTokensCleared = () => {
      // Event handler for token clearing
    };

    window.addEventListener('keysako:tokens_updated', handleTokensUpdated);
    window.addEventListener('keysako:tokens_cleared', handleTokensCleared);

    return () => {
      window.removeEventListener('keysako:tokens_updated', handleTokensUpdated);
      window.removeEventListener('keysako:tokens_cleared', handleTokensCleared);
    };
  }, [clientId, redirectUri, age, usePopup]);

  return <>{children}</>;
};
