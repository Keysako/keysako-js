import { ref, onMounted, onUnmounted } from 'vue';
import { IdentityProvider, TokenManager, AuthEvents, AuthResult, AuthError } from '@keysako-identity/core';
import { KeysakoOptions, KeysakoReturn, Ref } from './types';

/**
 * Vue composable for Keysako authentication
 * @param options Keysako options
 * @returns KeysakoReturn
 */
export function createKeysako(options: KeysakoOptions): KeysakoReturn {
  const { clientId, redirectUri, age, usePopup = false } = options;
  
  const isAuthenticated: Ref<boolean> = ref(false);
  let provider: IdentityProvider | null = null;
  let tokenManager: TokenManager | null = null;
  
  // Success and error callbacks
  let successCallback: ((result: AuthResult) => void) | null = null;
  let errorCallback: ((error: AuthError) => void) | null = null;
  
  onMounted(() => {
    // Initialize the provider and token manager
    tokenManager = TokenManager.getInstance();
    
    provider = IdentityProvider.initialize({
      clientId,
      redirectUri,
      age,
      usePopup,
      onAuthComplete: (result: AuthResult) => {
        isAuthenticated.value = result.success;
        
        if (result.success && successCallback) {
          successCallback(result);
        } else if (!result.success && errorCallback) {
          errorCallback({ error: result.error || 'Unknown error' });
        }
      }
    });
    
    // Check if user is already authenticated
    isAuthenticated.value = tokenManager.hasValidAccessToken();
    
    // Listen for token events
    const handleTokensUpdated = () => {
      if (tokenManager) {
        isAuthenticated.value = tokenManager.hasValidAccessToken();
      }
    };
    
    const handleTokensCleared = () => {
      isAuthenticated.value = false;
    };
    
    window.addEventListener(AuthEvents.TOKENS_UPDATED, handleTokensUpdated);
    window.addEventListener(AuthEvents.TOKENS_CLEARED, handleTokensCleared);
    
    // Clean up event listeners
    onUnmounted(() => {
      window.removeEventListener(AuthEvents.TOKENS_UPDATED, handleTokensUpdated);
      window.removeEventListener(AuthEvents.TOKENS_CLEARED, handleTokensCleared);
    });
  });
  
  /**
   * Start the login process
   */
  const login = async () => {
    if (provider) {
      await provider.login();
    }
  };
  
  /**
   * Logout the user
   */
  const logout = async () => {
    if (provider) {
      await provider.logout();
    }
  };
  
  /**
   * Get the access token
   * @returns Access token or null
   */
  const getAccessToken = () => {
    return tokenManager ? tokenManager.getAccessToken() : null;
  };
  
  /**
   * Get the ID token
   * @returns ID token or null
   */
  const getIdToken = () => {
    return tokenManager ? tokenManager.getIdToken() : null;
  };
  
  /**
   * Set success callback
   * @param callback Success callback function
   */
  const onSuccess = (callback: (result: AuthResult) => void) => {
    successCallback = callback;
  };
  
  /**
   * Set error callback
   * @param callback Error callback function
   */
  const onError = (callback: (error: AuthError) => void) => {
    errorCallback = callback;
  };
  
  return {
    isAuthenticated,
    login,
    logout,
    getAccessToken,
    getIdToken,
    onSuccess,
    onError
  };
}
