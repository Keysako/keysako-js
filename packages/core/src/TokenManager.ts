import { TokenStorage, createStorageStrategy, StorageStrategyType } from './storage';
import { TokenResponse, TokenClaims, AuthEvents } from './types';
import { parseJwt } from './utils';

/**
 * Configuration options for TokenManager
 */
export interface TokenManagerConfig {
  storageStrategy?: StorageStrategyType;
  encryptionKey?: string;
  customStorage?: TokenStorage;
}

/**
 * TokenManager class for handling authentication tokens
 */
export class TokenManager {
  private static readonly TOKEN_KEY = 'keysako_tokens';
  private static instance: TokenManager;
  private storage: TokenStorage;

  constructor(config?: TokenManagerConfig) {
    // Initialize storage strategy
    if (config?.customStorage) {
      this.storage = config.customStorage;
    } else {
      this.storage = createStorageStrategy(config?.storageStrategy || 'sessionStorage', {
        encryptionKey: config?.encryptionKey,
      });
    }
  }

  /**
   * Get the singleton instance of TokenManager
   * @param config Optional configuration for the first initialization
   * @returns TokenManager instance
   */
  static getInstance(config?: TokenManagerConfig): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager(config);
    }
    return TokenManager.instance;
  }

  /**
   * Configure the storage strategy (useful for changing strategy after initialization)
   * @param config New configuration
   */
  static configure(config: TokenManagerConfig): void {
    TokenManager.instance = new TokenManager(config);
  }

  /**
   * Save tokens to storage
   * @param tokens Token response from the server
   */
  async saveTokens(tokens: TokenResponse): Promise<void> {
    const expiresAt = Date.now() + tokens.expires_in * 1000;
    const tokenData = {
      ...tokens,
      expires_at: expiresAt,
    };

    await this.storage.setItem(TokenManager.TOKEN_KEY, tokenData);

    // Dispatch an event to notify that tokens have been updated
    window.dispatchEvent(
      new CustomEvent(AuthEvents.TOKENS_UPDATED, {
        detail: {
          ...tokenData,
          claims: await this.getTokenClaims(),
        },
      })
    );
  }

  /**
   * Get tokens from storage
   * @returns Tokens with expiration time or null if not found or expired
   */
  async getTokens(): Promise<(TokenResponse & { expires_at: number }) | null> {
    const tokens = await this.storage.getItem(TokenManager.TOKEN_KEY);
    if (!tokens) return null;

    if (Date.now() >= tokens.expires_at) {
      await this.clearTokens();
      return null;
    }

    return tokens;
  }

  /**
   * Get token claims from the access token
   * @returns Token claims or null if not found
   */
  async getTokenClaims(): Promise<TokenClaims | null> {
    const tokens = await this.getTokens();
    if (!tokens?.access_token) return null;

    try {
      return parseJwt(tokens.access_token);
    } catch (error) {
      console.error('Error parsing token claims:', error);
      return null;
    }
  }

  /**
   * Clear tokens from storage
   */
  async clearTokens(): Promise<void> {
    await this.storage.removeItem(TokenManager.TOKEN_KEY);
    window.dispatchEvent(new CustomEvent(AuthEvents.TOKENS_CLEARED));
  }

  /**
   * Check if the user is authenticated
   * @returns True if the user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const tokens = await this.getTokens();
    return tokens !== null;
  }

  /**
   * Get the access token
   * @returns Access token or null if not found
   */
  async getAccessToken(): Promise<string | null> {
    const tokens = await this.getTokens();
    return tokens ? tokens.access_token : null;
  }

  /**
   * Get the ID token
   * @returns ID token or null if not found
   */
  async getIdToken(): Promise<string | null> {
    const tokens = await this.getTokens();
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
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokens: TokenResponse = await response.json();
    await this.saveTokens(tokens);
    return tokens;
  }

  /**
   * Check if the access token is valid
   * @returns True if the access token is valid
   */
  async hasValidAccessToken(): Promise<boolean> {
    const tokens = await this.getTokens();
    return tokens !== null && Date.now() < tokens.expires_at;
  }

  /**
   * Get information about the current storage strategy
   * @returns Storage type information
   */
  getStorageInfo(): { type: string; available: boolean } {
    return {
      type: this.storage.getStorageType(),
      available: this.storage.isAvailable(),
    };
  }
}
