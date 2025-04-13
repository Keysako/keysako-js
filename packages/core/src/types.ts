/**
 * Configuration options for the Keysako Connect button
 */
export interface KeysakoButtonOptions {
  /** Client ID from Keysako */
  clientId: string;

  /** URI where users will be redirected after authentication */
  redirectUri?: string;

  /** Button theme ('default', 'light', or 'dark') */
  theme?: ButtonTheme;

  /** Button shape ('rounded' or 'sharp') */
  shape?: ButtonShape;

  /** Display only the logo without text */
  logoOnly?: boolean;

  /** Whether to use a popup for authentication */
  usePopup?: boolean;

  /** Age verification requirement */
  age?: number;

  /** Button locale (e.g., 'en', 'fr', 'es') */
  locale?: string;

  /** Callback function to handle authentication results */
  onSuccess?: (response: AuthResult) => void;

  /** Callback function to handle authentication errors */
  onError?: (error: AuthError) => void;
}

/**
 * Authentication result interface
 */
export interface AuthResult {
  /** Whether the authentication was successful */
  success: boolean;

  /** Access token (only present if success is true) */
  token?: string;

  /** Whether the age requirement was met (if age verification was requested) */
  hasRequiredAge?: boolean;

  /** Error message (only present if success is false) */
  error?: string;
}

/**
 * Authentication error
 */
export interface AuthError {
  /** Error message */
  error: string;

  /** Additional details */
  details?: any;
}

/**
 * Button theme options
 */
export type ButtonTheme = 'default' | 'light' | 'dark';

/**
 * Button shape options
 */
export type ButtonShape = 'rounded' | 'sharp';

/**
 * Identity provider configuration
 */
export interface IdentityConfig {
  /** Client ID from Keysako */
  clientId: string;

  /** URI where users will be redirected after authentication */
  redirectUri?: string;

  /** Age verification requirement */
  age?: number;

  /** Whether to use a popup for authentication */
  usePopup?: boolean;

  /** Callback function to handle authentication results */
  onAuthComplete?: (result: AuthResult) => void;
}

/**
 * Token response from the identity provider
 */
export interface TokenResponse {
  /** Access token */
  access_token: string;

  /** ID token (JWT) */
  id_token: string;

  /** Token type (usually "Bearer") */
  token_type: string;

  /** Token expiration time in seconds */
  expires_in: number;
}

/**
 * Token claims from the JWT
 */
export interface TokenClaims {
  /** Any claim from the token */
  [key: string]: any;
}

/**
 * Internal event types
 */
export enum AuthEvents {
  AUTH_COMPLETE = 'keysako:auth_complete',
  TOKENS_UPDATED = 'keysako:tokens_updated',
  TOKENS_CLEARED = 'keysako:tokens_cleared',
  ERROR = 'keysako:error',
}
