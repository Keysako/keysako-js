import { TokenStorage, TokenData } from './TokenStorage';

/**
 * In-memory implementation of TokenStorage
 * Most secure - tokens are not persisted and cleared on page reload
 * Use this for highly sensitive applications
 */
export class MemoryStorageStrategy implements TokenStorage {
  private storage = new Map<string, TokenData>();

  isAvailable(): boolean {
    return true; // Memory is always available
  }

  setItem(key: string, tokens: TokenData): void {
    this.storage.set(key, tokens);
  }

  getItem(key: string): TokenData | null {
    return this.storage.get(key) || null;
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  getStorageType(): string {
    return 'memory';
  }
}
