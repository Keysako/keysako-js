import { TokenStorage, TokenData } from './TokenStorage';

/**
 * Abstract base class that provides common functionality for custom token storage implementations
 * Users can extend this class to implement their own storage strategies
 */
export abstract class BaseTokenStorage implements TokenStorage {
  protected storageType: string;

  constructor(storageType: string) {
    this.storageType = storageType;
  }

  /**
   * Check if tokens are expired
   * @param tokens Token data to check
   * @returns True if tokens are expired
   */
  protected isExpired(tokens: TokenData): boolean {
    return Date.now() >= tokens.expires_at;
  }

  /**
   * Validate token data structure
   * @param tokens Token data to validate
   * @returns True if valid
   */
  protected isValidTokenData(tokens: any): tokens is TokenData {
    return (
      tokens &&
      typeof tokens === 'object' &&
      typeof tokens.access_token === 'string' &&
      typeof tokens.expires_at === 'number' &&
      tokens.access_token.length > 0
    );
  }

  /**
   * Handle errors gracefully with logging
   * @param operation Operation name for logging
   * @param error Error that occurred
   * @param fallbackValue Value to return on error
   */
  protected handleError<T>(operation: string, error: any, fallbackValue: T): T {
    console.warn(`TokenStorage(${this.storageType}) ${operation} failed:`, error);
    return fallbackValue;
  }

  /**
   * Serialize token data for storage
   * @param tokens Token data to serialize
   * @returns Serialized string
   */
  protected serialize(tokens: TokenData): string {
    return JSON.stringify(tokens);
  }

  /**
   * Deserialize token data from storage
   * @param data Serialized data
   * @returns Parsed token data or null if invalid
   */
  protected deserialize(data: string): TokenData | null {
    try {
      const parsed = JSON.parse(data);
      return this.isValidTokenData(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  // Abstract methods that must be implemented by subclasses
  abstract setItem(key: string, tokens: TokenData): Promise<void> | void;
  abstract getItem(key: string): Promise<TokenData | null> | TokenData | null;
  abstract removeItem(key: string): Promise<void> | void;
  abstract isAvailable(): boolean;

  getStorageType(): string {
    return this.storageType;
  }
}
