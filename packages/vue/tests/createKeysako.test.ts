// Mock Vue composition API first
const mockRef = jest.fn(value => ({ value }));
const mockOnMounted = jest.fn();
const mockOnUnmounted = jest.fn();

jest.mock('vue', () => ({
  ref: mockRef,
  onMounted: mockOnMounted,
  onUnmounted: mockOnUnmounted,
}));

// Mock the core module
jest.mock('@keysako/core', () => {
  const mockTokenManager = {
    hasValidAccessToken: jest.fn().mockResolvedValue(false),
    getAccessToken: jest.fn().mockResolvedValue('mock-access-token'),
    getIdToken: jest.fn().mockResolvedValue('mock-id-token'),
  };

  const mockProvider = {
    login: jest.fn().mockResolvedValue({}),
    logout: jest.fn().mockResolvedValue({}),
  };

  return {
    IdentityProvider: {
      initialize: jest.fn().mockReturnValue(mockProvider),
    },
    TokenManager: {
      getInstance: jest.fn().mockReturnValue(mockTokenManager),
    },
    AuthEvents: {
      TOKENS_UPDATED: 'keysako:tokens_updated',
      TOKENS_CLEARED: 'keysako:tokens_cleared',
    },
  };
});

import { createKeysako } from '../src/createKeysako';

describe('createKeysako', () => {
  const defaultOptions = {
    clientId: 'test-client-id',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return composable functions and reactive state', () => {
    const result = createKeysako(defaultOptions);

    expect(result).toHaveProperty('isAuthenticated');
    expect(result).toHaveProperty('login');
    expect(result).toHaveProperty('logout');
    expect(result).toHaveProperty('getAccessToken');
    expect(result).toHaveProperty('getIdToken');
    expect(result).toHaveProperty('onSuccess');
    expect(result).toHaveProperty('onError');

    expect(typeof result.login).toBe('function');
    expect(typeof result.logout).toBe('function');
    expect(typeof result.getAccessToken).toBe('function');
    expect(typeof result.getIdToken).toBe('function');
    expect(typeof result.onSuccess).toBe('function');
    expect(typeof result.onError).toBe('function');
  });

  it('should initialize isAuthenticated as false', () => {
    createKeysako(defaultOptions);
    expect(mockRef).toHaveBeenCalledWith(false);
  });

  it('should setup onMounted and onUnmounted hooks', () => {
    createKeysako(defaultOptions);
    expect(mockOnMounted).toHaveBeenCalledWith(expect.any(Function));
    expect(mockOnUnmounted).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should initialize provider when mounted', () => {
    createKeysako(defaultOptions);

    // Execute the onMounted callback
    const onMountedCallback = mockOnMounted.mock.calls[0][0];
    onMountedCallback();

    const { IdentityProvider } = jest.requireMock('@keysako/core');
    expect(IdentityProvider.initialize).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: 'test-client-id',
        onAuthComplete: expect.any(Function),
      })
    );
  });

  it('should call provider login method', async () => {
    const result = createKeysako(defaultOptions);

    // Execute the onMounted callback
    const onMountedCallback = mockOnMounted.mock.calls[0][0];
    await onMountedCallback();

    const { IdentityProvider } = jest.requireMock('@keysako/core');
    const mockProvider = IdentityProvider.initialize.mock.results[0].value;

    await result.login();
    expect(mockProvider.login).toHaveBeenCalled();
  });

  it('should call provider logout method', async () => {
    const result = createKeysako(defaultOptions);

    // Execute the onMounted callback
    const onMountedCallback = mockOnMounted.mock.calls[0][0];
    await onMountedCallback();

    const { IdentityProvider } = jest.requireMock('@keysako/core');
    const mockProvider = IdentityProvider.initialize.mock.results[0].value;

    await result.logout();
    expect(mockProvider.logout).toHaveBeenCalled();
  });

  it('should return access token from token manager', async () => {
    const result = createKeysako(defaultOptions);

    // Execute the onMounted callback
    const onMountedCallback = mockOnMounted.mock.calls[0][0];
    await onMountedCallback();

    const token = await result.getAccessToken();
    expect(token).toBe('mock-access-token');
  });

  it('should return id token from token manager', async () => {
    const result = createKeysako(defaultOptions);

    // Execute the onMounted callback
    const onMountedCallback = mockOnMounted.mock.calls[0][0];
    await onMountedCallback();

    const token = await result.getIdToken();
    expect(token).toBe('mock-id-token');
  });

  it('should handle success callback', () => {
    const result = createKeysako(defaultOptions);
    const successCallback = jest.fn();

    result.onSuccess(successCallback);

    // Execute the onMounted callback to initialize provider
    const onMountedCallback = mockOnMounted.mock.calls[0][0];
    onMountedCallback();

    // Simulate successful auth
    const { IdentityProvider } = jest.requireMock('@keysako/core');
    const initCall = IdentityProvider.initialize.mock.calls[0][0];
    const mockResult = { success: true, token: 'test-token' };

    initCall.onAuthComplete(mockResult);

    expect(successCallback).toHaveBeenCalledWith(mockResult);
  });

  it('should handle error callback', () => {
    const result = createKeysako(defaultOptions);
    const errorCallback = jest.fn();

    result.onError(errorCallback);

    // Execute the onMounted callback to initialize provider
    const onMountedCallback = mockOnMounted.mock.calls[0][0];
    onMountedCallback();

    // Simulate failed auth
    const { IdentityProvider } = jest.requireMock('@keysako/core');
    const initCall = IdentityProvider.initialize.mock.calls[0][0];
    const mockResult = { success: false, error: 'Authentication failed' };

    initCall.onAuthComplete(mockResult);

    expect(errorCallback).toHaveBeenCalledWith({ error: 'Authentication failed' });
  });

  it('should handle null provider gracefully', async () => {
    const result = createKeysako(defaultOptions);

    // These should not throw when provider is null
    await expect(result.login()).resolves.toBeUndefined();
    await expect(result.logout()).resolves.toBeUndefined();
  });

  it('should handle null token manager gracefully', async () => {
    const { TokenManager } = jest.requireMock('@keysako/core');
    TokenManager.getInstance.mockReturnValue(null);

    const result = createKeysako(defaultOptions);

    await expect(result.getAccessToken()).resolves.toBeNull();
    await expect(result.getIdToken()).resolves.toBeNull();
  });
});
