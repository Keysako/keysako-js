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
    // Reset the singleton instance and create a new one for testing
    (TokenManager as any).instance = undefined;
    tokenManager = TokenManager.getInstance();
  });
  
  afterEach(() => {
    // Clean up localStorage after each test
    localStorage.clear();
  });
  
  describe('saveTokens', () => {
    it('should store tokens in localStorage', () => {
      const tokenResponse = {
        access_token: 'access-token-123',
        id_token: 'id-token-456',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'openid profile'
      };
      
      tokenManager.saveTokens(tokenResponse);
      
      // Check that tokens are stored in localStorage
      const storedTokens = localStorage.getItem('keysako_tokens');
      expect(storedTokens).not.toBeNull();
      
      if (storedTokens) {
        const parsedTokens = JSON.parse(storedTokens);
        expect(parsedTokens.access_token).toBe(tokenResponse.access_token);
        expect(parsedTokens.id_token).toBe(tokenResponse.id_token);
        expect(parsedTokens.expires_in).toBe(tokenResponse.expires_in);
        
        // Check that expiry time is set correctly (with some tolerance for test execution time)
        expect(parsedTokens.expires_at).toBeGreaterThan(Date.now());
        expect(parsedTokens.expires_at).toBeLessThanOrEqual(Date.now() + (tokenResponse.expires_in * 1000) + 100);
      }
    });
  });
  
  describe('getAccessToken', () => {
    it('should return the stored access token', () => {
      const tokenResponse = {
        access_token: 'access-token-123',
        id_token: 'id-token-456',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'openid profile',
        expires_at: Date.now() + 3600000 // 1 hour in the future
      };
      
      localStorage.setItem('keysako_tokens', JSON.stringify(tokenResponse));
      
      expect(tokenManager.getAccessToken()).toBe(tokenResponse.access_token);
    });
    
    it('should return null if no token is stored', () => {
      expect(tokenManager.getAccessToken()).toBeNull();
    });
  });
  
  describe('getIdToken', () => {
    it('should return the stored ID token', () => {
      const tokenResponse = {
        access_token: 'access-token-123',
        id_token: 'id-token-456',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'openid profile',
        expires_at: Date.now() + 3600000 // 1 hour in the future
      };
      
      localStorage.setItem('keysako_tokens', JSON.stringify(tokenResponse));
      
      expect(tokenManager.getIdToken()).toBe(tokenResponse.id_token);
    });
    
    it('should return null if no token is stored', () => {
      expect(tokenManager.getIdToken()).toBeNull();
    });
  });
  
  describe('hasValidAccessToken', () => {
    it('should return true if token exists and is not expired', () => {
      const tokenResponse = {
        access_token: 'access-token-123',
        id_token: 'id-token-456',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'openid profile',
        expires_at: Date.now() + 3600000 // 1 hour in the future
      };
      
      localStorage.setItem('keysako_tokens', JSON.stringify(tokenResponse));
      
      expect(tokenManager.hasValidAccessToken()).toBe(true);
    });
    
    it('should return false if token does not exist', () => {
      expect(tokenManager.hasValidAccessToken()).toBe(false);
    });
    
    it('should return false if token is expired', () => {
      const tokenResponse = {
        access_token: 'access-token-123',
        id_token: 'id-token-456',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'openid profile',
        expires_at: Date.now() - 3600000 // 1 hour in the past
      };
      
      localStorage.setItem('keysako_tokens', JSON.stringify(tokenResponse));
      
      expect(tokenManager.hasValidAccessToken()).toBe(false);
    });
  });
  
  describe('clearTokens', () => {
    it('should remove all tokens from localStorage', () => {
      const tokenResponse = {
        access_token: 'access-token-123',
        id_token: 'id-token-456',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'openid profile',
        expires_at: Date.now() + 3600000
      };
      
      localStorage.setItem('keysako_tokens', JSON.stringify(tokenResponse));
      
      tokenManager.clearTokens();
      
      expect(localStorage.getItem('keysako_tokens')).toBeNull();
    });
  });
});
