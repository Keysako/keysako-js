import { TokenData, TokenStorage } from '@keysako/core';

/**
 * Simple Custom Storage Example
 *
 * This is a basic example showing how to implement a custom token storage.
 * This example uses a simple in-memory Map for demonstration purposes.
 *
 * In a real application, you might:
 * - Store tokens in a database
 * - Use encrypted local storage
 * - Implement server-side storage
 * - Add logging and audit trails
 */
export class SimpleCustomStorage implements TokenStorage {
  private storage = new Map<string, TokenData>();
  private storageType = 'simple-custom';

  /**
   * Get the storage type identifier
   */
  getStorageType(): string {
    return this.storageType;
  }

  /**
   * Check if this storage mechanism is available
   */
  isAvailable(): boolean {
    // Always available since we're using in-memory storage
    return true;
  }

  /**
   * Store token data
   */
  async setItem(key: string, tokens: TokenData): Promise<void> {
    try {
      // You can add custom logic here, such as:
      // - Encryption before storage
      // - Validation of token data
      // - Logging for audit purposes

      console.log(`[SimpleCustomStorage] Storing tokens for key: ${key}`);
      this.storage.set(key, tokens);

      // Example: Log the action for audit purposes
      console.log(
        `[SimpleCustomStorage] Tokens stored successfully. Expires at: ${new Date(tokens.expires_at)}`
      );
    } catch (error) {
      console.error('[SimpleCustomStorage] Error storing tokens:', error);
      throw error;
    }
  }

  /**
   * Retrieve token data
   */
  async getItem(key: string): Promise<TokenData | null> {
    try {
      console.log(`[SimpleCustomStorage] Retrieving tokens for key: ${key}`);

      const tokens = this.storage.get(key) || null;

      if (tokens) {
        // Check if tokens are expired
        if (Date.now() >= tokens.expires_at) {
          console.log('[SimpleCustomStorage] Tokens are expired, removing them');
          await this.removeItem(key);
          return null;
        }

        console.log('[SimpleCustomStorage] Valid tokens found');
        return tokens;
      }

      console.log('[SimpleCustomStorage] No tokens found');
      return null;
    } catch (error) {
      console.error('[SimpleCustomStorage] Error retrieving tokens:', error);
      return null;
    }
  }

  /**
   * Remove token data
   */
  async removeItem(key: string): Promise<void> {
    try {
      console.log(`[SimpleCustomStorage] Removing tokens for key: ${key}`);
      this.storage.delete(key);
      console.log('[SimpleCustomStorage] Tokens removed successfully');
    } catch (error) {
      console.error('[SimpleCustomStorage] Error removing tokens:', error);
    }
  }

  /**
   * Get storage statistics (custom method)
   */
  getStorageStats(): { totalKeys: number; keys: string[] } {
    return {
      totalKeys: this.storage.size,
      keys: Array.from(this.storage.keys()),
    };
  }

  /**
   * Clear all stored data (custom method)
   */
  async clearAll(): Promise<void> {
    console.log('[SimpleCustomStorage] Clearing all stored data');
    this.storage.clear();
    console.log('[SimpleCustomStorage] All data cleared');
  }
}
