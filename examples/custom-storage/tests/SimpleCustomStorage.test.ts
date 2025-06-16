/**
 * Simple Custom Storage Test
 * Tests basic custom storage functionality using Jest
 */

import { TokenData, TokenResponse } from '@keysako/core';

import { SimpleCustomStorage } from '../SimpleCustomStorage';

describe('SimpleCustomStorage', () => {
  let storage: SimpleCustomStorage;

  beforeEach(() => {
    storage = new SimpleCustomStorage();
  });

  describe('Storage Info', () => {
    test('should return correct storage type', () => {
      expect(storage.getStorageType()).toBe('simple-custom');
    });

    test('should be available', () => {
      expect(storage.isAvailable()).toBe(true);
    });

    test('should start with empty storage', () => {
      const stats = storage.getStorageStats();
      expect(stats.totalKeys).toBe(0);
      expect(stats.keys).toEqual([]);
    });
  });

  describe('Token Operations', () => {
    const testTokens: TokenData = {
      access_token: 'test-access-token',
      id_token: 'test-id-token',
      expires_in: 3600,
      token_type: 'Bearer',
      expires_at: Date.now() + 3600000,
    };

    test('should store and retrieve tokens', async () => {
      await storage.setItem('test-key', testTokens);

      const retrieved = await storage.getItem('test-key');
      expect(retrieved).toEqual(testTokens);
    });

    test('should return null for non-existent key', async () => {
      const retrieved = await storage.getItem('non-existent');
      expect(retrieved).toBeNull();
    });

    test('should remove tokens', async () => {
      await storage.setItem('test-key', testTokens);
      await storage.removeItem('test-key');

      const retrieved = await storage.getItem('test-key');
      expect(retrieved).toBeNull();
    });

    test('should handle expired tokens', async () => {
      const expiredTokens: TokenData = {
        ...testTokens,
        expires_at: Date.now() - 1000, // Already expired
      };

      await storage.setItem('expired-key', expiredTokens);
      const retrieved = await storage.getItem('expired-key');

      expect(retrieved).toBeNull();
    });

    test('should track storage stats correctly', async () => {
      await storage.setItem('key1', testTokens);
      await storage.setItem('key2', testTokens);

      const stats = storage.getStorageStats();
      expect(stats.totalKeys).toBe(2);
      expect(stats.keys).toContain('key1');
      expect(stats.keys).toContain('key2');
    });

    test('should clear all storage', async () => {
      await storage.setItem('key1', testTokens);
      await storage.setItem('key2', testTokens);

      await storage.clearAll();

      const stats = storage.getStorageStats();
      expect(stats.totalKeys).toBe(0);
      expect(stats.keys).toEqual([]);
    });
  });

  describe('Integration with TokenManager-like usage', () => {
    test('should work with typical TokenManager flow', async () => {
      const tokenResponse: TokenResponse = {
        access_token: 'oauth-access-token',
        id_token: 'oauth-id-token',
        expires_in: 3600,
        token_type: 'Bearer',
      };

      // Simulate TokenManager converting response to TokenData
      const tokenData: TokenData = {
        ...tokenResponse,
        id_token: tokenResponse.id_token || '',
        expires_at: Date.now() + tokenResponse.expires_in * 1000,
      };

      // Store tokens
      await storage.setItem('keysako_tokens', tokenData);

      // Retrieve tokens (like isAuthenticated check)
      const retrieved = await storage.getItem('keysako_tokens');
      expect(retrieved).not.toBeNull();
      expect(retrieved?.access_token).toBe(tokenResponse.access_token);

      // Clear tokens (like logout)
      await storage.removeItem('keysako_tokens');
      const afterClear = await storage.getItem('keysako_tokens');
      expect(afterClear).toBeNull();
    });
  });
});
