import { parseJwt } from './utils';
import { TokenResponse, TokenClaims, AuthEvents } from './types';

/**
 * TokenManager class for handling authentication tokens
 */
export class TokenManager {
  private static readonly TOKEN_KEY = 'keysako_tokens';
  private static instance: TokenManager;

  private constructor() {}

  /**
   * Get the singleton instance of TokenManager
   * @returns TokenManager instance
   */
  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * Save tokens to local storage
   * @param tokens Token response from the server
   */
  saveTokens(tokens: TokenResponse): void {
    const expiresAt = Date.now() + tokens.expires_in * 1000;
    const tokenData = {
      ...tokens,
      expires_at: expiresAt
    };
    localStorage.setItem(TokenManager.TOKEN_KEY, JSON.stringify(tokenData));

    // Dispatch an event to notify that tokens have been updated
    window.dispatchEvent(new CustomEvent(AuthEvents.TOKENS_UPDATED, {
      detail: {
        ...tokenData,
        claims: this.getTokenClaims()
      }
    }));
  }

  /**
   * Get tokens from local storage
   * @returns Tokens with expiration time or null if not found or expired
   */
  getTokens(): (TokenResponse & { expires_at: number }) | null {
    const tokenData = localStorage.getItem(TokenManager.TOKEN_KEY);
    if (!tokenData) return null;

    const tokens = JSON.parse(tokenData);
    if (Date.now() >= tokens.expires_at) {
      this.clearTokens();
      return null;
    }

    return tokens;
  }

  /**
   * Get token claims from the ID token
   * @returns Token claims or null if not found
   */
  getTokenClaims(): TokenClaims | null {
    const tokens = this.getTokens();
    if (!tokens?.id_token) return null;
    
    try {
      return parseJwt(tokens.id_token);
    } catch (error) {
      console.error('Error parsing token claims:', error);
      return null;
    }
  }

  /**
   * Check if the user has the required age
   * @returns True if the user has the required age
   */
  hasRequiredAge(): boolean {
    const claims = this.getTokenClaims();
    if (!claims) return false;
    
    // Check for the "has_minimum_age" claim
    // If it doesn't exist or is equal to true, the user has the minimum age
    return claims.has_minimum_age === undefined || claims.has_minimum_age === true;
  }

  /**
   * Clear tokens from local storage
   */
  clearTokens(): void {
    localStorage.removeItem(TokenManager.TOKEN_KEY);
    window.dispatchEvent(new CustomEvent(AuthEvents.TOKENS_CLEARED));
  }

  /**
   * Check if the user is authenticated
   * @returns True if the user is authenticated
   */
  isAuthenticated(): boolean {
    const tokens = this.getTokens();
    return tokens !== null;
  }

  /**
   * Get the access token
   * @returns Access token or null if not found
   */
  getAccessToken(): string | null {
    const tokens = this.getTokens();
    return tokens ? tokens.access_token : null;
  }

  /**
   * Get the ID token
   * @returns ID token or null if not found
   */
  getIdToken(): string | null {
    const tokens = this.getTokens();
    return tokens ? tokens.id_token : null;
  }

  /**
   * Exchange an authorization code for tokens
   * @param code Authorization code
   * @param codeVerifier Code verifier for PKCE
   * @param redirectUri Redirect URI
   * @param clientId Client ID
   * @param tokenEndpoint Token endpoint URL
   * @returns Token response
   */
  async getTokensFromCode(
    code: string, 
    codeVerifier: string, 
    redirectUri: string = window.location.origin,
    clientId: string,
    tokenEndpoint: string
  ): Promise<TokenResponse> {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: codeVerifier
      })
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokens: TokenResponse = await response.json();
    this.saveTokens(tokens);
    return tokens;
  }

  /**
   * Check if the access token is valid
   * @returns True if the access token is valid
   */
  hasValidAccessToken(): boolean {
    const tokens = this.getTokens();
    return tokens !== null && Date.now() < tokens.expires_at;
  }
}
