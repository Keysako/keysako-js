import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { KeysakoButton } from '../src/KeysakoButton';
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

describe('KeysakoButton', () => {
  const defaultProps = {
    clientId: 'test-client-id',
    redirectUri: 'https://example.com/callback',
    onSuccess: jest.fn(),
    onError: jest.fn()
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the button with default props', () => {
    render(<KeysakoButton {...defaultProps} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Sign in with Keysako');
  });
  
  it('renders the button with custom text', () => {
    render(<KeysakoButton {...defaultProps} text="Custom Button Text" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Custom Button Text');
  });
  
  it('applies the specified theme', () => {
    render(<KeysakoButton {...defaultProps} theme="dark" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('keysako-button-dark');
  });
  
  it('applies the specified shape', () => {
    render(<KeysakoButton {...defaultProps} shape="circle" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('keysako-button-circle');
  });
  
  it('calls login when clicked and not authenticated', () => {
    render(<KeysakoButton {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const mockIdentityProvider = IdentityProvider as jest.Mock;
    const mockLoginFn = mockIdentityProvider.mock.results[0].value.login;
    
    expect(mockLoginFn).toHaveBeenCalled();
  });
  
  it('calls logout when clicked and authenticated', () => {
    // Mock isAuthenticated to return true
    (IdentityProvider as jest.Mock).mockImplementation(() => ({
      login: jest.fn(),
      logout: jest.fn(),
      isAuthenticated: jest.fn().mockReturnValue(true),
      getAuthUrl: jest.fn().mockReturnValue('https://auth.keysako.com/oauth2/auth?client_id=test')
    }));
    
    render(<KeysakoButton {...defaultProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    const mockIdentityProvider = IdentityProvider as jest.Mock;
    const mockLogoutFn = mockIdentityProvider.mock.results[0].value.logout;
    
    expect(mockLogoutFn).toHaveBeenCalled();
  });
  
  it('passes onSuccess and onError callbacks to IdentityProvider', () => {
    render(<KeysakoButton {...defaultProps} />);
    
    const mockIdentityProvider = IdentityProvider as jest.Mock;
    const mockConfig = mockIdentityProvider.mock.calls[0][0];
    
    expect(mockConfig.onSuccess).toBe(defaultProps.onSuccess);
    expect(mockConfig.onError).toBe(defaultProps.onError);
  });
});
