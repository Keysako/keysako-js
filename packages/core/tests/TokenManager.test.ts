import { TokenManager } from '../src/TokenManager';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('TokenManager', () => {
  let tokenManager: TokenManager;
  
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // @ts-ignore - We're testing a private constructor
    tokenManager = new TokenManager();
  });
  
  afterEach(() => {
    // Clean up localStorage after each test
    localStorage.clear();
  });
  
  describe('setTokens', () => {
    it('should store tokens in localStorage', () => {
      const accessToken = 'access-token-123';
      const idToken = 'id-token-456';
      const expiresIn = 3600;
      
      // @ts-ignore - We're testing a private method
      tokenManager.setTokens(accessToken, idToken, expiresIn);
      
      expect(localStorage.getItem('keysako_access_token')).toBe(accessToken);
      expect(localStorage.getItem('keysako_id_token')).toBe(idToken);
      
      // Check that expiry time is set correctly (with some tolerance for test execution time)
      const expiryTime = Number(localStorage.getItem('keysako_token_expiry'));
      const expectedExpiryTime = Math.floor(Date.now() / 1000) + expiresIn;
      expect(expiryTime).toBeGreaterThanOrEqual(expectedExpiryTime - 5);
      expect(expiryTime).toBeLessThanOrEqual(expectedExpiryTime + 5);
    });
  });
  
  describe('getAccessToken', () => {
    it('should return the stored access token', () => {
      const accessToken = 'access-token-123';
      localStorage.setItem('keysako_access_token', accessToken);
      
      expect(tokenManager.getAccessToken()).toBe(accessToken);
    });
    
    it('should return null if no token is stored', () => {
      expect(tokenManager.getAccessToken()).toBeNull();
    });
  });
  
  describe('getIdToken', () => {
    it('should return the stored ID token', () => {
      const idToken = 'id-token-456';
      localStorage.setItem('keysako_id_token', idToken);
      
      expect(tokenManager.getIdToken()).toBe(idToken);
    });
    
    it('should return null if no token is stored', () => {
      expect(tokenManager.getIdToken()).toBeNull();
    });
  });
  
  describe('hasValidAccessToken', () => {
    it('should return true if token exists and is not expired', () => {
      localStorage.setItem('keysako_access_token', 'access-token-123');
      // Set expiry time to 1 hour in the future
      const expiryTime = Math.floor(Date.now() / 1000) + 3600;
      localStorage.setItem('keysako_token_expiry', expiryTime.toString());
      
      expect(tokenManager.hasValidAccessToken()).toBe(true);
    });
    
    it('should return false if token does not exist', () => {
      expect(tokenManager.hasValidAccessToken()).toBe(false);
    });
    
    it('should return false if token is expired', () => {
      localStorage.setItem('keysako_access_token', 'access-token-123');
      // Set expiry time to 1 hour in the past
      const expiryTime = Math.floor(Date.now() / 1000) - 3600;
      localStorage.setItem('keysako_token_expiry', expiryTime.toString());
      
      expect(tokenManager.hasValidAccessToken()).toBe(false);
    });
  });
  
  describe('clearTokens', () => {
    it('should remove all tokens from localStorage', () => {
      localStorage.setItem('keysako_access_token', 'access-token-123');
      localStorage.setItem('keysako_id_token', 'id-token-456');
      localStorage.setItem('keysako_token_expiry', '12345');
      
      tokenManager.clearTokens();
      
      expect(localStorage.getItem('keysako_access_token')).toBeNull();
      expect(localStorage.getItem('keysako_id_token')).toBeNull();
      expect(localStorage.getItem('keysako_token_expiry')).toBeNull();
    });
  });
});
