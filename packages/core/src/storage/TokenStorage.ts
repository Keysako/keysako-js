import { TokenResponse } from '../types';

export interface TokenData extends TokenResponse {
  expires_at: number;
}

/**
 * Interface for token storage strategies
 */
export interface TokenStorage {
  /**
   * Store tokens
   * @param key Storage key
   * @param tokens Token data to store
   */
  setItem(key: string, tokens: TokenData): Promise<void> | void;

  /**
   * Retrieve tokens
   * @param key Storage key
   * @returns Token data or null if not found
   */
  getItem(key: string): Promise<TokenData | null> | TokenData | null;

  /**
   * Remove tokens
   * @param key Storage key
   */
  removeItem(key: string): Promise<void> | void;

  /**
   * Check if storage is available
   * @returns True if storage is available
   */
  isAvailable(): boolean;

  /**
   * Get storage type name for debugging
   */
  getStorageType(): string;
}
