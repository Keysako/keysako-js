import { BaseTokenStorage } from './BaseTokenStorage';
import { EncryptedStorageStrategy } from './EncryptedStorageStrategy';
import { LocalStorageStrategy } from './LocalStorageStrategy';
import { MemoryStorageStrategy } from './MemoryStorageStrategy';
import { SessionStorageStrategy } from './SessionStorageStrategy';
import { TokenStorage, TokenData } from './TokenStorage';

export type { TokenStorage, TokenData };
export {
  LocalStorageStrategy,
  SessionStorageStrategy,
  MemoryStorageStrategy,
  EncryptedStorageStrategy,
  BaseTokenStorage,
};

/**
 * Storage strategy types for configuration
 */
export type StorageStrategyType = 'localStorage' | 'sessionStorage' | 'memory' | 'encrypted';

/**
 * Factory function to create storage strategies
 */
export function createStorageStrategy(
  type: StorageStrategyType,
  options?: { encryptionKey?: string }
): TokenStorage {
  switch (type) {
    case 'sessionStorage':
      return new SessionStorageStrategy();
    case 'memory':
      return new MemoryStorageStrategy();
    case 'encrypted':
      return new EncryptedStorageStrategy(new LocalStorageStrategy(), options?.encryptionKey);
    case 'localStorage':
    default:
      return new LocalStorageStrategy();
  }
}
