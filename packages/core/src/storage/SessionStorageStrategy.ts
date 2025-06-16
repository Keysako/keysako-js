import { TokenStorage, TokenData } from './TokenStorage';

/**
 * SessionStorage implementation of TokenStorage
 * More secure than localStorage - tokens are cleared when tab is closed
 */
export class SessionStorageStrategy implements TokenStorage {
  isAvailable(): boolean {
    try {
      const test = '__test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  setItem(key: string, tokens: TokenData): void {
    sessionStorage.setItem(key, JSON.stringify(tokens));
  }

  getItem(key: string): TokenData | null {
    const data = sessionStorage.getItem(key);
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  removeItem(key: string): void {
    sessionStorage.removeItem(key);
  }

  getStorageType(): string {
    return 'sessionStorage';
  }
}
