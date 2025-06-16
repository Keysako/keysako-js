import {
  LocalStorageStrategy,
  SessionStorageStrategy,
  MemoryStorageStrategy,
  EncryptedStorageStrategy,
  TokenData,
} from '../../src/storage';

describe('Token Storage Strategies', () => {
  const mockTokenData: TokenData = {
    access_token: 'test-access-token',
    id_token: 'test-id-token',
    expires_in: 3600,
    token_type: 'Bearer',
    expires_at: Date.now() + 3600000,
  };

  describe('LocalStorageStrategy', () => {
    let storage: LocalStorageStrategy;

    beforeEach(() => {
      storage = new LocalStorageStrategy();
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('should be available', () => {
      expect(storage.isAvailable()).toBe(true);
    });

    it('should store and retrieve tokens', () => {
      const key = 'test-key';
      storage.setItem(key, mockTokenData);

      const retrieved = storage.getItem(key);
      expect(retrieved).toEqual(mockTokenData);
    });

    it('should remove tokens', () => {
      const key = 'test-key';
      storage.setItem(key, mockTokenData);
      storage.removeItem(key);

      const retrieved = storage.getItem(key);
      expect(retrieved).toBeNull();
    });

    it('should return correct storage type', () => {
      expect(storage.getStorageType()).toBe('localStorage');
    });

    it('should handle corrupted data gracefully', () => {
      const key = 'test-key';
      localStorage.setItem(key, 'invalid-json');

      const retrieved = storage.getItem(key);
      expect(retrieved).toBeNull();
    });
  });

  describe('SessionStorageStrategy', () => {
    let storage: SessionStorageStrategy;

    beforeEach(() => {
      storage = new SessionStorageStrategy();
      sessionStorage.clear();
    });

    afterEach(() => {
      sessionStorage.clear();
    });

    it('should be available', () => {
      expect(storage.isAvailable()).toBe(true);
    });

    it('should store and retrieve tokens', () => {
      const key = 'test-key';
      storage.setItem(key, mockTokenData);

      const retrieved = storage.getItem(key);
      expect(retrieved).toEqual(mockTokenData);
    });

    it('should return correct storage type', () => {
      expect(storage.getStorageType()).toBe('sessionStorage');
    });
  });

  describe('MemoryStorageStrategy', () => {
    let storage: MemoryStorageStrategy;

    beforeEach(() => {
      storage = new MemoryStorageStrategy();
    });

    it('should always be available', () => {
      expect(storage.isAvailable()).toBe(true);
    });

    it('should store and retrieve tokens', () => {
      const key = 'test-key';
      storage.setItem(key, mockTokenData);

      const retrieved = storage.getItem(key);
      expect(retrieved).toEqual(mockTokenData);
    });

    it('should remove tokens', () => {
      const key = 'test-key';
      storage.setItem(key, mockTokenData);
      storage.removeItem(key);

      const retrieved = storage.getItem(key);
      expect(retrieved).toBeNull();
    });

    it('should return correct storage type', () => {
      expect(storage.getStorageType()).toBe('memory');
    });

    it('should isolate storage between instances', () => {
      const storage1 = new MemoryStorageStrategy();
      const storage2 = new MemoryStorageStrategy();

      storage1.setItem('key', mockTokenData);

      expect(storage1.getItem('key')).toEqual(mockTokenData);
      expect(storage2.getItem('key')).toBeNull();
    });
  });

  describe('EncryptedStorageStrategy', () => {
    let storage: EncryptedStorageStrategy;
    let mockFallbackStorage: LocalStorageStrategy;

    beforeEach(() => {
      mockFallbackStorage = new LocalStorageStrategy();
      storage = new EncryptedStorageStrategy(
        mockFallbackStorage,
        'test-encryption-key-32-chars-xx'
      );
      localStorage.clear();
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('should be available when fallback storage is available', () => {
      expect(storage.isAvailable()).toBe(true);
    });

    it('should encrypt and decrypt tokens', () => {
      const key = 'test-key';
      storage.setItem(key, mockTokenData);

      // Verify data is encrypted in fallback storage
      const rawData = mockFallbackStorage.getItem(key);
      expect(rawData?.access_token).not.toBe(mockTokenData.access_token);

      // Verify data can be decrypted
      const retrieved = storage.getItem(key);
      expect(retrieved).toEqual(mockTokenData);
    });

    it('should handle decryption errors gracefully', () => {
      const key = 'test-key';
      // Store corrupted encrypted data
      mockFallbackStorage.setItem(key, {
        ...mockTokenData,
        access_token: 'corrupted-data',
      } as any);

      const retrieved = storage.getItem(key);
      expect(retrieved).toBeNull();
    });

    it('should return correct storage type', () => {
      expect(storage.getStorageType()).toBe('encrypted(localStorage)');
    });
  });
});
