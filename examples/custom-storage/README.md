# Custom Token Storage Examples

This directory contains examples of custom token storage implementations for Keysako Identity. These examples demonstrate how to implement secure, scalable, and flexible token storage strategies beyond the built-in options.

## Overview

Keysako Identity provides a pluggable storage system that allows you to implement custom token storage strategies. This is useful for:

- **Enterprise applications** requiring server-side token storage
- **High-security environments** needing advanced encryption
- **Compliance requirements** demanding audit trails
- **Performance optimization** with caching layers
- **Cross-platform applications** with specific storage needs

## Simple Custom Storage Example

### Basic Implementation (`simple-custom-storage.ts`)

- **Use case**: Basic custom storage implementation
- **Benefits**: Easy to understand, in-memory storage with logging
- **Best for**: Learning how to implement custom storage, development/testing

```typescript
import { TokenManager } from '@keysako/core';
import { SimpleCustomStorage } from './simple-custom-storage';

// Create your custom storage instance
const customStorage = new SimpleCustomStorage();

// Initialize TokenManager with your custom storage
const tokenManager = TokenManager.getInstance({
  customStorage: customStorage,
});

// Now all token operations will use your custom storage
const isAuthenticated = await tokenManager.isAuthenticated();
const accessToken = await tokenManager.getAccessToken();

// You can also access custom methods
const stats = customStorage.getStorageStats();
console.log('Storage stats:', stats);
```

## Implementation Guide

All custom storage implementations must implement the `TokenStorage` interface:

```typescript
interface TokenStorage {
  getStorageType(): string;
  isAvailable(): boolean;
  setItem(key: string, tokens: TokenData): void | Promise<void>;
  getItem(key: string): TokenData | null | Promise<TokenData | null>;
  removeItem(key: string): void | Promise<void>;
}
```

### Basic Structure

```typescript
export class MyCustomStorage implements TokenStorage {
  getStorageType(): string {
    return 'my-storage-type';
  }

  isAvailable(): boolean {
    // Check if your storage mechanism is available
    return true;
  }

  async setItem(key: string, tokens: TokenData): Promise<void> {
    // Your storage logic
  }

  async getItem(key: string): Promise<TokenData | null> {
    // Your retrieval logic
    // Don't forget to check token expiration!
    if (tokens && Date.now() >= tokens.expires_at) {
      await this.removeItem(key);
      return null;
    }
    return tokens;
  }

  async removeItem(key: string): Promise<void> {
    // Your removal logic
  }
}
```

## Using Custom Storage

Use your custom storage by passing it to the TokenManager:

```typescript
import { TokenManager } from '@keysako/core';
import { MyCustomStorage } from './my-custom-storage';

const tokenManager = TokenManager.getInstance({
  customStorage: new MyCustomStorage(),
});
```

## Security Considerations

When implementing custom storage:

1. **Always validate data** before storage/retrieval
2. **Handle errors gracefully** to prevent information leakage
3. **Implement proper expiration** to avoid stale tokens
4. **Consider encryption** for sensitive environments
5. **Log security events** for audit purposes
6. **Test failure scenarios** thoroughly

## Performance Tips

- **Use async operations** for I/O-heavy storage
- **Implement caching** for frequently accessed tokens
- **Batch operations** when possible
- **Monitor storage size** and cleanup old data
- **Test under load** to identify bottlenecks

## Testing Your Implementation

Test your custom storage implementation with:

```typescript
// Test availability
console.log('Storage available:', storage.isAvailable());

// Test storage and retrieval
const testTokens = {
  access_token: 'test-token',
  id_token: 'test-id-token',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  token_type: 'Bearer',
};

await storage.setItem('test-key', testTokens);
const retrieved = await storage.getItem('test-key');
console.log('Retrieved tokens:', retrieved);

await storage.removeItem('test-key');
const afterRemoval = await storage.getItem('test-key');
console.log('After removal:', afterRemoval); // Should be null
```

## Running the Examples

### TypeScript Tests (Recommended)

```bash
# Install dependencies
npm install

# Run all TypeScript tests
npm test

# Run individual TypeScript tests
npm run test:simple           # Simple storage test
npm run test:tokenmanager     # TokenManager integration test
```

### Legacy JavaScript Tests

```bash
# Run individual JavaScript tests (legacy)
npm run test:old:simple           # Simple storage test
npm run test:old:tokenmanager     # TokenManager integration test
```

## Contributing

When contributing new storage examples:

1. Follow the `TokenStorage` interface
2. Include comprehensive error handling
3. Document security implications
4. Provide clear usage examples
5. Add TypeScript types

## Support

For questions about custom storage implementations:

- Check the [Custom Storage Guide](../../packages/core/CUSTOM_STORAGE_GUIDE.md)
- Review existing implementations
- Open an issue on GitHub
- Join our community discussions
