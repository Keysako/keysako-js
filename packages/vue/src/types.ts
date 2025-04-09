import { KeysakoButtonOptions, AuthResult, AuthError } from '@keysako-identity/core';

/**
 * Props for the KeysakoButton component
 */
export interface KeysakoButtonProps extends Omit<KeysakoButtonOptions, 'onSuccess' | 'onError'> {
  /** CSS class name for the button */
  class?: string;
  
  /** Inline styles for the button */
  style?: Record<string, string>;
}

/**
 * Options for the createKeysako composable
 */
export interface KeysakoOptions {
  /** Client ID from Keysako */
  clientId: string;
  
  /** URI where users will be redirected after authentication */
  redirectUri?: string;
  
  /** Age verification requirement */
  age?: number;
  
  /** Whether to use a popup for authentication */
  usePopup?: boolean;
}

/**
 * Return type for the createKeysako composable
 */
export interface KeysakoReturn {
  /** Whether the user is authenticated */
  isAuthenticated: Ref<boolean>;
  
  /** Login function */
  login: () => Promise<void>;
  
  /** Logout function */
  logout: () => Promise<void>;
  
  /** Get access token function */
  getAccessToken: () => string | null;
  
  /** Get ID token function */
  getIdToken: () => string | null;
  
  /** Handle success callback */
  onSuccess: (callback: (result: AuthResult) => void) => void;
  
  /** Handle error callback */
  onError: (callback: (error: AuthError) => void) => void;
}

// Add Vue 3 ref type for TypeScript
export interface Ref<T> {
  value: T;
}
