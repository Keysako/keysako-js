import React from 'react';
import { render, act } from '@testing-library/react';
import { KeysakoProvider, useKeysako } from '../src/KeysakoProvider';
import { IdentityProvider } from '@keysako-identity/core';

// Mock the IdentityProvider
jest.mock('@keysako-identity/core', () => {
  const originalModule = jest.requireActual('@keysako-identity/core');
  
  return {
    ...originalModule,
    IdentityProvider: jest.fn().mockImplementation(() => ({
      login: jest.fn().mockResolvedValue({}),
      logout: jest.fn(),
      isAuthenticated: jest.fn().mockReturnValue(false),
      getAuthUrl: jest.fn().mockReturnValue('https://auth.keysako.com/oauth2/auth?client_id=test')
    }))
  };
});

// Test component that uses the useKeysako hook
const TestComponent = () => {
  const { isAuthenticated, login, logout } = useKeysako();
  
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <button data-testid="login-button" onClick={login}>Login</button>
      <button data-testid="logout-button" onClick={logout}>Logout</button>
    </div>
  );
};

describe('KeysakoProvider', () => {
  const defaultProps = {
    clientId: 'test-client-id',
    redirectUri: 'https://example.com/callback',
    onSuccess: jest.fn(),
    onError: jest.fn()
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('provides authentication context to child components', () => {
    const { getByTestId } = render(
      <KeysakoProvider {...defaultProps}>
        <TestComponent />
      </KeysakoProvider>
    );
    
    // Check initial authentication status
    expect(getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
  });
  
  it('calls login method from IdentityProvider when login is called', async () => {
    const { getByTestId } = render(
      <KeysakoProvider {...defaultProps}>
        <TestComponent />
      </KeysakoProvider>
    );
    
    // Click the login button
    await act(async () => {
      getByTestId('login-button').click();
    });
    
    // Check that login was called
    const mockIdentityProvider = IdentityProvider as jest.Mock;
    const mockLoginFn = mockIdentityProvider.mock.results[0].value.login;
    expect(mockLoginFn).toHaveBeenCalled();
  });
  
  it('calls logout method from IdentityProvider when logout is called', async () => {
    const { getByTestId } = render(
      <KeysakoProvider {...defaultProps}>
        <TestComponent />
      </KeysakoProvider>
    );
    
    // Click the logout button
    await act(async () => {
      getByTestId('logout-button').click();
    });
    
    // Check that logout was called
    const mockIdentityProvider = IdentityProvider as jest.Mock;
    const mockLogoutFn = mockIdentityProvider.mock.results[0].value.logout;
    expect(mockLogoutFn).toHaveBeenCalled();
  });
  
  it('updates authentication status when provider changes', async () => {
    // Mock isAuthenticated to initially return false
    const mockIsAuthenticated = jest.fn().mockReturnValue(false);
    (IdentityProvider as jest.Mock).mockImplementation(() => ({
      login: jest.fn(),
      logout: jest.fn(),
      isAuthenticated: mockIsAuthenticated,
      getAuthUrl: jest.fn()
    }));
    
    const { getByTestId, rerender } = render(
      <KeysakoProvider {...defaultProps}>
        <TestComponent />
      </KeysakoProvider>
    );
    
    // Initial status should be not authenticated
    expect(getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    
    // Change the mock to return true
    mockIsAuthenticated.mockReturnValue(true);
    
    // Rerender with the same props to trigger an update
    rerender(
      <KeysakoProvider {...defaultProps}>
        <TestComponent />
      </KeysakoProvider>
    );
    
    // Now it should show as authenticated
    expect(getByTestId('auth-status')).toHaveTextContent('Authenticated');
  });
  
  it('passes onSuccess and onError callbacks to IdentityProvider', () => {
    render(
      <KeysakoProvider {...defaultProps}>
        <TestComponent />
      </KeysakoProvider>
    );
    
    const mockIdentityProvider = IdentityProvider as jest.Mock;
    const mockConfig = mockIdentityProvider.mock.calls[0][0];
    
    expect(mockConfig.onSuccess).toBeDefined();
    expect(mockConfig.onError).toBeDefined();
  });
});
