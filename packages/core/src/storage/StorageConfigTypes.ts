/**
 * Storage strategy types for configuration
 */
export type StorageStrategyType = 'localStorage' | 'sessionStorage' | 'memory' | 'encrypted';

/**
 * Configuration options for storage strategies
 */
export interface StorageOptions {
  encryptionKey?: string;
}
