import { TokenManager } from './TokenManager';
import { IdentityConfig, AuthResult, AuthEvents } from './types';
import { generateRandomString, isMobileDevice } from './utils';

/**
 * IdentityProvider class for handling authentication with Keysako
 */
export class IdentityProvider {
  // Default identity server endpoints
  private static readonly DEFAULT_SERVER_URI = 'https://auth.keysako.com';
  
  // Get the server URI from environment variable or use default
  private static getServerUri(): string {
    // Check for environment variable in browser context
    if (typeof window !== 'undefined') {
      // @ts-ignore - Access potential Vite env variables
      const envServerUri = window.ENV_KEYSAKO_IDENTITY_SERVER_URI || 
                          // @ts-ignore - For create-react-app style env vars
                          (window.process?.env?.REACT_APP_KEYSAKO_IDENTITY_SERVER_URI) ||
                          // @ts-ignore - For Vite
                          (import.meta as any)?.env?.VITE_KEYSAKO_IDENTITY_SERVER_URI;
                          
      if (envServerUri) {
        return envServerUri;
      }
    }
    return IdentityProvider.DEFAULT_SERVER_URI;
  }
  
  // Dynamic endpoints based on server URI
  private static get AUTHORIZATION_ENDPOINT(): string {
    return `${IdentityProvider.getServerUri()}/connect/authorize`;
  }
  
  private static get TOKEN_ENDPOINT(): string {
    return `${IdentityProvider.getServerUri()}/connect/token`;
  }
  
  private static get END_SESSION_ENDPOINT(): string {
    return `${IdentityProvider.getServerUri()}/connect/endsession`;
  }
  
  private static readonly BASE_SCOPE = 'openid profile';
  private static readonly RESPONSE_TYPE = 'code';
  private static readonly POPUP_WIDTH = 500;
  private static readonly POPUP_HEIGHT = 600;

  private config: IdentityConfig;
  private static instance: IdentityProvider;
  private tokenManager: TokenManager;
  private popupWindow: Window | null = null;
  private popupMessageListener: ((event: MessageEvent) => void) | null = null;

  private constructor(config: IdentityConfig) {
    this.config = {
      redirectUri: window.location.origin,
      usePopup: false,
      ...config
    };
    this.tokenManager = TokenManager.getInstance();
    this.handleCallbackIfPresent();
  }

  /**
   * Initialize the IdentityProvider with configuration
   * @param config Identity configuration
   * @returns IdentityProvider instance
   */
  static initialize(config: IdentityConfig): IdentityProvider {
    if (!IdentityProvider.instance) {
      IdentityProvider.instance = new IdentityProvider(config);
    }
    return IdentityProvider.instance;
  }

  /**
   * Get the singleton instance of IdentityProvider
   * @returns IdentityProvider instance
   * @throws Error if not initialized
   */
  static getInstance(): IdentityProvider {
    if (!IdentityProvider.instance) {
      throw new Error('IdentityProvider must be initialized with a config first');
    }
    return IdentityProvider.instance;
  }

  /**
   * Get the scope for authorization
   * @returns Space-separated scope string
   */
  private getScope(): string {
    // Use only the base scope without age verification
    return IdentityProvider.BASE_SCOPE;
  }

  /**
   * Handle the callback if present in the URL
   */
  private handleCallbackIfPresent(): void {
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.has('code')) {
      this.handleCallback(queryParams);
    }
  }

  /**
   * Generate a code challenge for PKCE
   * @returns Code verifier and code challenge
   */
  private async generateCodeChallenge(): Promise<{ codeVerifier: string; codeChallenge: string }> {
    const array = new Uint32Array(32);
    window.crypto.getRandomValues(array);
    const codeVerifier = Array.from(array, dec => ('0' + dec.toString(16)).slice(-2)).join('');

    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);

    const base64Digest = btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    return { codeVerifier, codeChallenge: base64Digest };
  }

  /**
   * Start the login process
   */
  async login(): Promise<void> {
    const { codeVerifier, codeChallenge } = await this.generateCodeChallenge();
    const state = generateRandomString();
    const nonce = generateRandomString();

    sessionStorage.setItem('auth_state', state);
    sessionStorage.setItem('auth_nonce', nonce);
    sessionStorage.setItem('code_verifier', codeVerifier);

    const redirectUri = this.config.redirectUri || window.location.origin;
    
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: redirectUri,
      response_type: IdentityProvider.RESPONSE_TYPE,
      scope: this.getScope(),
      state: state,
      nonce: nonce,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });

    const authUrl = `${IdentityProvider.AUTHORIZATION_ENDPOINT}?${params.toString()}`;

    if (this.config.usePopup && !isMobileDevice()) {
      // Use popup flow
      this.popupWindow = this.openPopupWindow(authUrl);
      if (!this.popupWindow) {
        // Fallback to redirect if popup is blocked
        window.location.href = authUrl;
        return;
      }

      try {
        const { code, state: returnedState } = await this.setupPopupMessageListener();
        
        // Verify state
        const storedState = sessionStorage.getItem('auth_state');
        if (storedState !== returnedState) {
          throw new Error('Invalid state parameter');
        }

        // Handle the authorization code
        await this.handleCallback(new URLSearchParams({ code, state: returnedState }));
      } catch (error) {
        console.error('Popup authentication error:', error);
        
        // Dispatch error event
        const errorEvent = new CustomEvent(AuthEvents.ERROR, { 
          detail: { error: error instanceof Error ? error.message : 'Unknown error' } 
        });
        window.dispatchEvent(errorEvent);
      }
    } else {
      // Use redirect flow
      window.location.href = authUrl;
    }
  }

  /**
   * Handle the callback from the authorization server
   * @param queryParams Query parameters from the callback
   */
  private async handleCallback(queryParams: URLSearchParams): Promise<void> {
    const state = queryParams.get('state');
    const code = queryParams.get('code');
    const storedState = sessionStorage.getItem('auth_state');
    const codeVerifier = sessionStorage.getItem('code_verifier');

    if (!code) {
      const error = 'No authorization code received';
      if (this.config.onAuthComplete) {
        this.config.onAuthComplete({ success: false, error });
      }
      throw new Error(error);
    }

    if (state !== storedState) {
      const error = 'Invalid state parameter';
      if (this.config.onAuthComplete) {
        this.config.onAuthComplete({ success: false, error });
      }
      throw new Error(error);
    }

    try {
      await this.tokenManager.getTokensFromCode(
        code, 
        codeVerifier!, 
        this.config.redirectUri || window.location.origin,
        this.config.clientId,
        IdentityProvider.TOKEN_ENDPOINT
      );
      
      // Check age if required
      const hasRequiredAge = this.tokenManager.hasRequiredAge();

      if (this.config.onAuthComplete) {
        this.config.onAuthComplete({ 
          success: true,
          hasRequiredAge
        });
      }

      // Dispatch auth complete event
      window.dispatchEvent(new CustomEvent(AuthEvents.AUTH_COMPLETE, {
        detail: { 
          success: true,
          hasRequiredAge
        },
        bubbles: true,
        composed: true
      }));

      // Clean up storage
      sessionStorage.removeItem('auth_state');
      sessionStorage.removeItem('auth_nonce');
      sessionStorage.removeItem('code_verifier');
    } catch (error: any) {
      const authError = { 
        success: false, 
        error: error.message 
      };
      
      if (this.config.onAuthComplete) {
        this.config.onAuthComplete(authError);
      }
      
      // Dispatch auth complete event with error
      window.dispatchEvent(new CustomEvent(AuthEvents.AUTH_COMPLETE, {
        detail: authError,
        bubbles: true,
        composed: true
      }));
      
      throw error;
    }
  }

  /**
   * Set up the popup message listener
   * @returns Promise that resolves with the code and state
   */
  private setupPopupMessageListener(): Promise<{ code: string, state: string }> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (this.popupWindow) {
          this.popupWindow.close();
        }
        reject(new Error('Popup authentication timed out'));
      }, 300000); // 5 minutes timeout

      this.popupMessageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) {
          return;
        }

        const data = event.data;
        if (data.type === 'authorization_response') {
          clearTimeout(timeout);
          if (this.popupMessageListener) {
            window.removeEventListener('message', this.popupMessageListener);
            this.popupMessageListener = null;
          }
          if (this.popupWindow) {
            this.popupWindow.close();
            this.popupWindow = null;
          }
          resolve(data);
        }
      };

      window.addEventListener('message', this.popupMessageListener);
    });
  }

  /**
   * Open a popup window for authentication
   * @param url URL to open in the popup
   * @returns Popup window or null if blocked
   */
  private openPopupWindow(url: string): Window | null {
    const width = IdentityProvider.POPUP_WIDTH;
    const height = IdentityProvider.POPUP_HEIGHT;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2.5;

    return window.open(
      url,
      'oauth-popup',
      `width=${width},height=${height},left=${left},top=${top},location=yes,toolbar=no,menubar=no`
    );
  }

  /**
   * Check if the user is authenticated
   * @returns True if authenticated
   */
  isAuthenticated(): boolean {
    return this.tokenManager.hasValidAccessToken();
  }

  /**
   * Get the access token
   * @returns Access token or null
   */
  getAccessToken(): string | null {
    return this.tokenManager.getAccessToken();
  }

  /**
   * Get the ID token
   * @returns ID token or null
   */
  getIdToken(): string | null {
    return this.tokenManager.getIdToken();
  }

  /**
   * Logout the user
   */
  async logout(): Promise<void> {
    const tokens = this.tokenManager.getTokens();
    const idToken = tokens?.id_token;
    
    // Clean up local tokens
    this.tokenManager.clearTokens();

    if (!idToken) {
      // If no token, just redirect to home page
      window.location.href = window.location.origin;
      return;
    }

    const postLogoutRedirectUri = this.config.redirectUri || window.location.origin;
    
    const params = new URLSearchParams({
      id_token_hint: idToken,
      post_logout_redirect_uri: postLogoutRedirectUri,
      client_id: this.config.clientId
    });

    if (this.config.usePopup && !isMobileDevice()) {
      this.popupWindow = this.openPopupWindow(`${IdentityProvider.END_SESSION_ENDPOINT}?${params.toString()}`);
      if (!this.popupWindow) {
        // Fallback to redirect mode if popup is blocked
        window.location.href = `${IdentityProvider.END_SESSION_ENDPOINT}?${params.toString()}`;
        return;
      }

      try {
        // Wait for the popup to close
        await new Promise<void>((resolve) => {
          const checkClosed = setInterval(() => {
            if (this.popupWindow?.closed) {
              clearInterval(checkClosed);
              this.popupWindow = null;
              resolve();
            }
          }, 500);

          // Timeout after 30 seconds
          setTimeout(() => {
            clearInterval(checkClosed);
            if (this.popupWindow) {
              this.popupWindow.close();
              this.popupWindow = null;
            }
            resolve();
          }, 30000);
        });

        // Redirect to home page after popup closes
        if (window.location.href !== postLogoutRedirectUri) {
          window.location.href = postLogoutRedirectUri;
        }
      } catch (error) {
        console.error('Logout popup error:', error);
        // In case of error, force redirect
        window.location.href = `${IdentityProvider.END_SESSION_ENDPOINT}?${params.toString()}`;
      }
    } else {
      // Classic redirect mode
      window.location.href = `${IdentityProvider.END_SESSION_ENDPOINT}?${params.toString()}`;
    }
  }
}
