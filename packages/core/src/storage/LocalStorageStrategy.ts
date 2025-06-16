import { TokenStorage, TokenData } from './TokenStorage';

/**
 * LocalStorage implementation of TokenStorage
 * Less secure but widely compatible
 */
export class LocalStorageStrategy implements TokenStorage {
  isAvailable(): boolean {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  setItem(key: string, tokens: TokenData): void {
    localStorage.setItem(key, JSON.stringify(tokens));
  }

  getItem(key: string): TokenData | null {
    const data = localStorage.getItem(key);
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  getStorageType(): string {
    return 'localStorage';
  }
}
