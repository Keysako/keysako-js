import { KeysakoButtonOptions, AuthResult, AuthError } from '@keysako/core';

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
