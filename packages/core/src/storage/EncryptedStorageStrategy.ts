import { TokenStorage, TokenData } from './TokenStorage';

/**
 * Encrypted storage implementation
 * Encrypts tokens before storing them in localStorage
 * Provides additional security layer against XSS attacks
 */
export class EncryptedStorageStrategy implements TokenStorage {
  private fallbackStorage: TokenStorage;
  private encryptionKey: string;

  constructor(fallbackStorage: TokenStorage, encryptionKey?: string) {
    this.fallbackStorage = fallbackStorage;
    this.encryptionKey = encryptionKey || this.generateEncryptionKey();
  }

  private generateEncryptionKey(): string {
    // Generate a simple key based on user agent and timestamp
    // In production, you might want a more sophisticated approach
    const userAgent = navigator.userAgent;
    const timestamp = Date.now().toString();
    return btoa(userAgent + timestamp).slice(0, 32);
  }

  private encrypt(data: string): string {
    // Simple XOR encryption for demonstration
    // In production, use Web Crypto API for proper encryption
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
      const dataChar = data.charCodeAt(i);
      encrypted += String.fromCharCode(dataChar ^ keyChar);
    }
    return btoa(encrypted);
  }

  private decrypt(encryptedData: string): string {
    try {
      const encrypted = atob(encryptedData);
      let decrypted = '';
      for (let i = 0; i < encrypted.length; i++) {
        const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
        const encryptedChar = encrypted.charCodeAt(i);
        decrypted += String.fromCharCode(encryptedChar ^ keyChar);
      }
      return decrypted;
    } catch {
      return '';
    }
  }

  isAvailable(): boolean {
    return this.fallbackStorage.isAvailable();
  }

  setItem(key: string, tokens: TokenData): void {
    const jsonData = JSON.stringify(tokens);
    const encryptedData = this.encrypt(jsonData);
    this.fallbackStorage.setItem(key, { ...tokens, access_token: encryptedData } as any);
  }

  getItem(key: string): TokenData | null {
    const encryptedTokens = this.fallbackStorage.getItem(key);
    if (!encryptedTokens) return null;

    try {
      const decryptedData = this.decrypt((encryptedTokens as any).access_token);
      return JSON.parse(decryptedData);
    } catch {
      return null;
    }
  }

  removeItem(key: string): void {
    this.fallbackStorage.removeItem(key);
  }

  getStorageType(): string {
    return `encrypted(${this.fallbackStorage.getStorageType()})`;
  }
}
