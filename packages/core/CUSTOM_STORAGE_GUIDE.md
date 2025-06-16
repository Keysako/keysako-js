# Custom Storage Implementation Guide

This guide explains how to create your own token storage strategy for Keysako Identity.

## TokenStorage Interface

Any custom storage strategy must implement the `TokenStorage` interface:

```typescript
interface TokenStorage {
  setItem(key: string, tokens: TokenData): Promise<void> | void;
  getItem(key: string): Promise<TokenData | null> | TokenData | null;
  removeItem(key: string): Promise<void> | void;
  isAvailable(): boolean;
  getStorageType(): string;
}
```

## Built-in Storage Strategies

Keysako Identity provides several built-in storage strategies:

- **SessionStorageStrategy** (default): Secure, cleared when tab closes
- **MemoryStorageStrategy**: Most secure, doesn't persist across page loads
- **EncryptedStorageStrategy**: Encrypted localStorage with fallback support
- **LocalStorageStrategy**: Legacy localStorage support

## Option 1: Direct Interface Implementation

```typescript
import { TokenStorage, TokenData } from '@keysako/core';

class MyCustomStorage implements TokenStorage {
  isAvailable(): boolean {
    // Check if your storage mechanism is available
    return true;
  }

  setItem(key: string, tokens: TokenData): void {
    // Store the tokens
    // tokens contains: access_token, id_token, expires_at, etc.
  }

  getItem(key: string): TokenData | null {
    // Retrieve the tokens
    // Return null if not found or expired
  }

  removeItem(key: string): void {
    // Remove the tokens
  }

  getStorageType(): string {
    return 'my-custom-storage';
  }
}

// Usage
const tokenManager = TokenManager.getInstance({
  customStorage: new MyCustomStorage(),
});
```

## Option 2: Using BaseTokenStorage (Recommended)

The `BaseTokenStorage` class provides you with convenient utilities:

```typescript
import { BaseTokenStorage, TokenData } from '@keysako/core';

class MyAdvancedStorage extends BaseTokenStorage {
  constructor() {
    super('my-advanced-storage');
  }

  isAvailable(): boolean {
    return true; // Your verification logic
  }

  setItem(key: string, tokens: TokenData): void {
    try {
      // You can use this.serialize(tokens) to convert to string
      const serialized = this.serialize(tokens);
      // Your storage logic
    } catch (error) {
      // this.handleError handles errors with logging
      this.handleError('setItem', error, undefined);
    }
  }

  getItem(key: string): TokenData | null {
    try {
      // Your retrieval logic
      const data = 'your-retrieved-data';

      // Use this.deserialize to parse
      const tokens = this.deserialize(data);

      // this.isExpired automatically checks expiration
      if (tokens && this.isExpired(tokens)) {
        this.removeItem(key);
        return null;
      }

      return tokens;
    } catch (error) {
      return this.handleError('getItem', error, null);
    }
  }

  removeItem(key: string): void {
    // Your removal logic
  }
}
```

## Implementation Examples

### 1. Using Built-in Storage Strategies

```typescript
import { TokenManager } from '@keysako/core';

// Default: Session storage (secure, cleared when tab closes)
const tokenManager = TokenManager.getInstance();

// Memory storage (most secure, doesn't persist)
const tokenManager = TokenManager.getInstance({
  storageStrategy: 'memory',
});

// Encrypted localStorage
const tokenManager = TokenManager.getInstance({
  storageStrategy: 'encrypted',
  encryptionKey: 'your-encryption-key',
});

// Legacy localStorage (for backward compatibility)
const tokenManager = TokenManager.getInstance({
  storageStrategy: 'localStorage',
});
```

### 2. Database Storage Example

```typescript
import { BaseTokenStorage, TokenData } from '@keysako/core';

class IndexedDBStorage extends BaseTokenStorage {
  private dbName = 'KeysakoTokens';
  private storeName = 'tokens';

  constructor() {
    super('indexeddb');
  }

  isAvailable(): boolean {
    return 'indexedDB' in window;
  }

  async setItem(key: string, tokens: TokenData): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      await store.put({ key, tokens, timestamp: Date.now() });
    } catch (error) {
      this.handleError('setItem', error, undefined);
    }
  }

  async getItem(key: string): Promise<TokenData | null> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const result = await store.get(key);

      if (!result || !result.tokens) return null;

      if (this.isExpired(result.tokens)) {
        await this.removeItem(key);
        return null;
      }

      return result.tokens;
    } catch (error) {
      return this.handleError('getItem', error, null);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      await store.delete(key);
    } catch (error) {
      this.handleError('removeItem', error, undefined);
    }
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = event => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' });
        }
      };
    });
  }
}
```

### 3. Secure Cookie Storage Example

```typescript
import { BaseTokenStorage, TokenData } from '@keysako/core';

class SecureCookieStorage extends BaseTokenStorage {
  private options: {
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    path?: string;
  };

  constructor(options: typeof this.options = {}) {
    super('secure-cookie');
    this.options = {
      secure: true,
      sameSite: 'strict',
      path: '/',
      ...options,
    };
  }

  isAvailable(): boolean {
    return typeof document !== 'undefined';
  }

  setItem(key: string, tokens: TokenData): void {
    try {
      const serialized = this.serialize(tokens);
      const encoded = encodeURIComponent(serialized);

      let cookieString = `${key}=${encoded}`;

      if (this.options.domain) cookieString += `; Domain=${this.options.domain}`;
      if (this.options.path) cookieString += `; Path=${this.options.path}`;
      if (this.options.secure) cookieString += '; Secure';
      if (this.options.sameSite) cookieString += `; SameSite=${this.options.sameSite}`;

      // Set expiration based on token expiration
      const expirationDate = new Date(tokens.expires_at);
      cookieString += `; Expires=${expirationDate.toUTCString()}`;

      document.cookie = cookieString;
    } catch (error) {
      this.handleError('setItem', error, undefined);
    }
  }

  getItem(key: string): TokenData | null {
    try {
      const cookies = document.cookie.split('; ');
      const cookie = cookies.find(c => c.startsWith(`${key}=`));

      if (!cookie) return null;

      const encoded = cookie.split('=')[1];
      const serialized = decodeURIComponent(encoded);
      const tokens = this.deserialize(serialized);

      if (tokens && this.isExpired(tokens)) {
        this.removeItem(key);
        return null;
      }

      return tokens;
    } catch (error) {
      return this.handleError('getItem', error, null);
    }
  }

  removeItem(key: string): void {
    try {
      let cookieString = `${key}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;

      if (this.options.domain) cookieString += `; Domain=${this.options.domain}`;
      if (this.options.path) cookieString += `; Path=${this.options.path}`;

      document.cookie = cookieString;
    } catch (error) {
      this.handleError('removeItem', error, undefined);
    }
  }
}
```

### 4. Multi-layer Storage with Fallback

```typescript
import { BaseTokenStorage, TokenData } from '@keysako/core';

class MultiLayerStorage extends BaseTokenStorage {
  private storageStrategies: TokenStorage[];

  constructor(strategies: TokenStorage[]) {
    super('multi-layer');
    this.storageStrategies = strategies.filter(s => s.isAvailable());
  }

  isAvailable(): boolean {
    return this.storageStrategies.length > 0;
  }

  async setItem(key: string, tokens: TokenData): Promise<void> {
    const promises = this.storageStrategies.map(async storage => {
      try {
        await storage.setItem(key, tokens);
      } catch (error) {
        console.warn(`Failed to store in ${storage.getStorageType()}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  async getItem(key: string): Promise<TokenData | null> {
    for (const storage of this.storageStrategies) {
      try {
        const tokens = await storage.getItem(key);
        if (tokens && !this.isExpired(tokens)) {
          return tokens;
        }
      } catch (error) {
        console.warn(`Failed to retrieve from ${storage.getStorageType()}:`, error);
      }
    }
    return null;
  }

  async removeItem(key: string): Promise<void> {
    const promises = this.storageStrategies.map(async storage => {
      try {
        await storage.removeItem(key);
      } catch (error) {
        console.warn(`Failed to remove from ${storage.getStorageType()}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }
}

// Usage
const tokenManager = TokenManager.getInstance({
  customStorage: new MultiLayerStorage([
    new IndexedDBStorage(), // Priority 1
    new SessionStorageStrategy(), // Fallback 1
    new MemoryStorageStrategy(), // Fallback 2
  ]),
});
```

## Advanced Use Cases

### Custom Encrypted Storage

```typescript
import { BaseTokenStorage, TokenData } from '@keysako/core';

class AdvancedEncryptedStorage extends BaseTokenStorage {
  private encryptionKey: CryptoKey;

  constructor(encryptionKey: CryptoKey) {
    super('advanced-encrypted');
    this.encryptionKey = encryptionKey;
  }

  async setItem(key: string, tokens: TokenData): Promise<void> {
    try {
      const data = this.serialize(tokens);
      const encrypted = await this.encrypt(data);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      this.handleError('setItem', error, undefined);
    }
  }

  async getItem(key: string): Promise<TokenData | null> {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;

      const decrypted = await this.decrypt(encrypted);
      const tokens = this.deserialize(decrypted);

      if (tokens && this.isExpired(tokens)) {
        this.removeItem(key);
        return null;
      }

      return tokens;
    } catch (error) {
      return this.handleError('getItem', error, null);
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  isAvailable(): boolean {
    return 'crypto' in window && 'localStorage' in window;
  }

  private async encrypt(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey,
      dataBuffer
    );
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...combined));
  }

  private async decrypt(encryptedData: string): Promise<string> {
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey,
      encrypted
    );
    return new TextDecoder().decode(decrypted);
  }
}
```

### Storage with Audit and Logging

```typescript
class AuditableStorage extends BaseTokenStorage {
  private auditLogger: (event: string, data: any) => void;

  constructor(auditLogger: (event: string, data: any) => void) {
    super('auditable');
    this.auditLogger = auditLogger;
  }

  setItem(key: string, tokens: TokenData): void {
    try {
      sessionStorage.setItem(key, this.serialize(tokens));
      this.auditLogger('TOKEN_STORED', {
        key,
        expires_at: tokens.expires_at,
        timestamp: Date.now(),
      });
    } catch (error) {
      this.auditLogger('TOKEN_STORE_FAILED', { key, error: error.message });
      this.handleError('setItem', error, undefined);
    }
  }

  getItem(key: string): TokenData | null {
    try {
      const data = sessionStorage.getItem(key);
      if (!data) {
        this.auditLogger('TOKEN_NOT_FOUND', { key });
        return null;
      }

      const tokens = this.deserialize(data);
      if (tokens && this.isExpired(tokens)) {
        this.auditLogger('TOKEN_EXPIRED', { key, expires_at: tokens.expires_at });
        this.removeItem(key);
        return null;
      }

      this.auditLogger('TOKEN_RETRIEVED', { key });
      return tokens;
    } catch (error) {
      this.auditLogger('TOKEN_RETRIEVE_FAILED', { key, error: error.message });
      return this.handleError('getItem', error, null);
    }
  }

  removeItem(key: string): void {
    sessionStorage.removeItem(key);
    this.auditLogger('TOKEN_REMOVED', { key, timestamp: Date.now() });
  }

  isAvailable(): boolean {
    return 'sessionStorage' in window;
  }
}

// Usage
const tokenManager = TokenManager.getInstance({
  customStorage: new AuditableStorage((event, data) => {
    console.log(`[AUDIT] ${event}:`, data);
    // Send to your audit system
  }),
});
```

## BaseTokenStorage Utility Methods

The `BaseTokenStorage` class provides these utility methods:

- `isExpired(tokens)`: Checks if tokens are expired
- `isValidTokenData(tokens)`: Validates token data structure
- `handleError(operation, error, fallback)`: Error handling with logging
- `serialize(tokens)`: Converts tokens to JSON string
- `deserialize(data)`: Parses JSON string to TokenData

## Best Practices

1. **Always check `isAvailable()`** before using storage
2. **Handle errors gracefully** with try/catch
3. **Check expiration** before returning tokens
4. **Log errors** for debugging
5. **Test serialization/deserialization** of your data
6. **Consider security** according to your environment
7. **Implement fallbacks** if necessary

## Testing Your Implementation

```typescript
import { TokenData } from '@keysako/core';

// Test data
const testTokens: TokenData = {
  access_token: 'test-access-token',
  id_token: 'test-id-token',
  expires_in: 3600,
  token_type: 'Bearer',
  expires_at: Date.now() + 3600000,
};

// Basic test
const storage = new MyCustomStorage();

console.log('Storage available:', storage.isAvailable());

// Test storage
storage.setItem('test-key', testTokens);

// Test retrieval
const retrieved = storage.getItem('test-key');
console.log('Retrieved tokens:', retrieved);

// Test removal
storage.removeItem('test-key');
console.log('After removal:', storage.getItem('test-key')); // should be null
```

This approach gives you complete flexibility to adapt token storage to your specific needs while benefiting from the utilities and robustness of the Keysako system.
