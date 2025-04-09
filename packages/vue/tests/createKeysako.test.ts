import { createKeysako } from '../src/createKeysako';
import { IdentityProvider } from '@keysako-identity/core';

// Mock Vue's composition API
jest.mock('vue', () => ({
  ref: jest.fn(val => ({
    value: val,
    __isRef: true
  })),
  computed: jest.fn(fn => ({
    value: fn(),
    __isRef: true
  })),
  onMounted: jest.fn(fn => fn()),
  onUnmounted: jest.fn(fn => fn)
}));

// Mock the IdentityProvider
jest.mock('@keysako-identity/core', () => {
  return {
    IdentityProvider: jest.fn().mockImplementation(() => ({
      login: jest.fn().mockResolvedValue({}),
      logout: jest.fn(),
      isAuthenticated: jest.fn().mockReturnValue(false),
      getAuthUrl: jest.fn().mockReturnValue('https://auth.keysako.com/oauth2/auth?client_id=test')
    }))
  };
});

describe('createKeysako', () => {
  const defaultOptions = {
    clientId: 'test-client-id',
    redirectUri: 'https://example.com/callback'
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('creates and returns the expected composable API', () => {
    const keysako = createKeysako(defaultOptions);
    
    // Check that the composable returns the expected properties and methods
    expect(keysako.isAuthenticated).toBeDefined();
    expect(keysako.user).toBeDefined();
    expect(keysako.login).toBeDefined();
    expect(keysako.logout).toBeDefined();
    expect(keysako.provider).toBeDefined();
  });
  
  it('initializes IdentityProvider with the provided options', () => {
    createKeysako(defaultOptions);
    
    // Check that IdentityProvider was called with the correct options
    expect(IdentityProvider).toHaveBeenCalledWith(expect.objectContaining({
      clientId: defaultOptions.clientId,
      redirectUri: defaultOptions.redirectUri
    }));
  });
  
  it('calls login method from IdentityProvider when login is called', async () => {
    const keysako = createKeysako(defaultOptions);
    
    await keysako.login();
    
    // Check that login was called
    const mockIdentityProvider = IdentityProvider as jest.Mock;
    const mockLoginFn = mockIdentityProvider.mock.results[0].value.login;
    expect(mockLoginFn).toHaveBeenCalled();
  });
  
  it('calls logout method from IdentityProvider when logout is called', () => {
    const keysako = createKeysako(defaultOptions);
    
    keysako.logout();
    
    // Check that logout was called
    const mockIdentityProvider = IdentityProvider as jest.Mock;
    const mockLogoutFn = mockIdentityProvider.mock.results[0].value.logout;
    expect(mockLogoutFn).toHaveBeenCalled();
  });
  
  it('provides the authentication status from IdentityProvider', () => {
    // Mock isAuthenticated to return true
    (IdentityProvider as jest.Mock).mockImplementation(() => ({
      login: jest.fn(),
      logout: jest.fn(),
      isAuthenticated: jest.fn().mockReturnValue(true),
      getAuthUrl: jest.fn()
    }));
    
    const keysako = createKeysako(defaultOptions);
    
    // Check that isAuthenticated reflects the value from IdentityProvider
    expect(keysako.isAuthenticated.value).toBe(true);
  });
  
  it('handles onSuccess callback', () => {
    const onSuccess = jest.fn();
    
    createKeysako({
      ...defaultOptions,
      onSuccess
    });
    
    // Get the onSuccess callback that was passed to IdentityProvider
    const mockIdentityProvider = IdentityProvider as jest.Mock;
    const mockConfig = mockIdentityProvider.mock.calls[0][0];
    const providedOnSuccess = mockConfig.onSuccess;
    
    // Call the provided onSuccess callback
    const authResult = { success: true, token: 'test-token' };
    providedOnSuccess(authResult);
    
    // Check that our onSuccess callback was called with the auth result
    expect(onSuccess).toHaveBeenCalledWith(authResult);
  });
  
  it('handles onError callback', () => {
    const onError = jest.fn();
    
    createKeysako({
      ...defaultOptions,
      onError
    });
    
    // Get the onError callback that was passed to IdentityProvider
    const mockIdentityProvider = IdentityProvider as jest.Mock;
    const mockConfig = mockIdentityProvider.mock.calls[0][0];
    const providedOnError = mockConfig.onError;
    
    // Call the provided onError callback
    const authError = { error: 'Authentication failed' };
    providedOnError(authError);
    
    // Check that our onError callback was called with the auth error
    expect(onError).toHaveBeenCalledWith(authError);
  });
});
