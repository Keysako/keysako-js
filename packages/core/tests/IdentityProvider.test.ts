import { IdentityProvider } from '../src/IdentityProvider';
import { TokenManager } from '../src/TokenManager';

// Mock TokenManager
jest.mock('../src/TokenManager', () => {
  return {
    TokenManager: jest.fn().mockImplementation(() => ({
      setTokens: jest.fn(),
      getAccessToken: jest.fn(),
      getIdToken: jest.fn(),
      hasValidAccessToken: jest.fn(),
      clearTokens: jest.fn()
    }))
  };
});

describe('IdentityProvider', () => {
  let provider: IdentityProvider;
  let mockTokenManager: jest.Mocked<TokenManager>;
  
  const mockConfig = {
    clientId: 'test-client-id',
    redirectUri: 'https://example.com/callback',
    onSuccess: jest.fn(),
    onError: jest.fn(),
    onAuthComplete: jest.fn()
  };
  
  beforeEach(() => {
    // Clear mocks and localStorage
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    
    // Create a new provider instance for each test
    // @ts-ignore - We're testing a private constructor
    provider = new IdentityProvider(mockConfig);
    // @ts-ignore - We're testing a private constructor
    mockTokenManager = new TokenManager() as jest.Mocked<TokenManager>;
  });
  
  afterEach(() => {
    // Clean up
    localStorage.clear();
    sessionStorage.clear();
  });
  
  describe('constructor', () => {
    it('should initialize with the provided configuration', () => {
      // @ts-ignore - Accessing private property for testing
      expect(provider['config']).toEqual(mockConfig);
    });
    
    it('should create a TokenManager instance', () => {
      expect(TokenManager).toHaveBeenCalled();
    });
  });
  
  describe('getAuthUrl', () => {
    it('should generate a valid authorization URL', () => {
      // Mock random string generation
      jest.spyOn(global.Math, 'random').mockReturnValue(0.5);
      
      // @ts-ignore - Testing private method
      const url = provider.getAuthUrl();
      
      // Parse the URL to check its components
      const parsedUrl = new URL(url);
      
      expect(parsedUrl.origin + parsedUrl.pathname).toBe('https://auth.keysako.com/oauth2/auth');
      expect(parsedUrl.searchParams.get('client_id')).toBe(mockConfig.clientId);
      expect(parsedUrl.searchParams.get('redirect_uri')).toBe(mockConfig.redirectUri);
      expect(parsedUrl.searchParams.get('response_type')).toBe('code');
      expect(parsedUrl.searchParams.get('scope')).toBe('openid profile email');
      
      // Check that state and code_challenge are set
      expect(parsedUrl.searchParams.get('state')).toBeTruthy();
      expect(parsedUrl.searchParams.get('code_challenge')).toBeTruthy();
      expect(parsedUrl.searchParams.get('code_challenge_method')).toBe('S256');
      
      // Check that state and code_verifier are stored in sessionStorage
      expect(sessionStorage.getItem('auth_state')).toBeTruthy();
      expect(sessionStorage.getItem('code_verifier')).toBeTruthy();
    });
    
    it('should include age verification if specified', () => {
      // @ts-ignore - We're testing a private constructor
      provider = new IdentityProvider({
        ...mockConfig,
        age: 18
      });
      
      // @ts-ignore - Testing private method
      const url = provider.getAuthUrl();
      const parsedUrl = new URL(url);
      
      expect(parsedUrl.searchParams.get('age_required')).toBe('18');
    });
  });
  
  describe('isAuthenticated', () => {
    it('should return true if TokenManager has a valid access token', () => {
      (mockTokenManager.hasValidAccessToken as jest.Mock).mockReturnValue(true);
      
      // Need to cast to any to access private property
      (provider as any).tokenManager = mockTokenManager;
      
      expect(provider.isAuthenticated()).toBe(true);
      expect(mockTokenManager.hasValidAccessToken).toHaveBeenCalled();
    });
    
    it('should return false if TokenManager does not have a valid access token', () => {
      (mockTokenManager.hasValidAccessToken as jest.Mock).mockReturnValue(false);
      
      // Need to cast to any to access private property
      (provider as any).tokenManager = mockTokenManager;
      
      expect(provider.isAuthenticated()).toBe(false);
      expect(mockTokenManager.hasValidAccessToken).toHaveBeenCalled();
    });
  });
  
  describe('logout', () => {
    it('should clear tokens and call onSuccess callback', () => {
      // Need to cast to any to access private property
      (provider as any).tokenManager = mockTokenManager;
      
      provider.logout();
      
      expect(mockTokenManager.clearTokens).toHaveBeenCalled();
      expect(mockConfig.onSuccess).toHaveBeenCalledWith({ success: true });
    });
  });
});
