import { KeysakoButtonOptions, AuthResult, AuthError } from '@keysako-identity/core';
import { ReactNode } from 'react';

/**
 * Props for the KeysakoButton component
 */
export interface KeysakoButtonProps extends Omit<KeysakoButtonOptions, 'onSuccess' | 'onError'> {
  /** CSS class name for the button */
  className?: string;

  /** Inline styles for the button */
  style?: React.CSSProperties;

  /** Callback function to handle successful authentication */
  onSuccess?: (response: AuthResult) => void;

  /** Callback function to handle authentication errors */
  onError?: (error: AuthError) => void;
}

/**
 * Props for the KeysakoProvider component
 */
export interface KeysakoProviderProps {
  /** Client ID from Keysako */
  clientId: string;

  /** URI where users will be redirected after authentication */
  redirectUri?: string;

  /** Age verification requirement */
  age?: number;

  /** Whether to use a popup for authentication */
  usePopup?: boolean;

  /** Children components */
  children: ReactNode;
}
