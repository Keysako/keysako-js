import { render } from '@testing-library/react';
import React from 'react';

import { KeysakoButton } from '../src/KeysakoButton';

// Mock the modules from core
jest.mock('@keysako-identity/core', () => {
  const mockCreateButtonElement = jest.fn().mockImplementation(() => {
    const button = document.createElement('button');
    button.className = 'keysako-button';
    button.setAttribute('data-testid', 'keysako-button');
    return button;
  });

  const mockGetStyles = jest.fn().mockReturnValue(`
    .keysako-button {
      background-color: var(--keysako-btn-bg);
      color: var(--keysako-btn-color);
    }
  `);

  return {
    KeysakoButton: jest.fn().mockImplementation(() => ({
      createButtonElement: mockCreateButtonElement,
      getStyles: mockGetStyles,
    })),
    IdentityProvider: {
      initialize: jest.fn().mockImplementation(() => ({
        login: jest.fn().mockResolvedValue({}),
        logout: jest.fn(),
        isAuthenticated: jest.fn().mockReturnValue(false),
        getAuthUrl: jest
          .fn()
          .mockReturnValue('https://auth.keysako.com/oauth2/auth?client_id=test'),
      })),
      getInstance: jest.fn(),
    },
    TokenManager: {
      getInstance: jest.fn().mockReturnValue({
        hasValidAccessToken: jest.fn().mockReturnValue(false),
      }),
    },
    AuthEvents: {
      TOKENS_UPDATED: 'keysako:tokens_updated',
      TOKENS_CLEARED: 'keysako:tokens_cleared',
      AUTH_COMPLETE: 'keysako:auth_complete',
      ERROR: 'keysako:error',
    },
    ButtonShape: {
      ROUNDED: 'rounded',
      SHARP: 'sharp',
    },
    ButtonTheme: {
      DEFAULT: 'default',
      LIGHT: 'light',
      DARK: 'dark',
    },
  };
});

describe('KeysakoButton', () => {
  const defaultProps = {
    clientId: 'test-client-id',
    redirectUri: 'https://example.com/callback',
    onSuccess: jest.fn(),
    onError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the button with default props', () => {
    const { container } = render(<KeysakoButton {...defaultProps} />);

    expect(container.querySelector('div[data-keysako-button="true"]')).toBeInTheDocument();
    expect(container.querySelector('.keysako-button')).toBeInTheDocument();
  });

  it('initializes the core button with correct props', () => {
    render(<KeysakoButton {...defaultProps} theme="dark" shape="sharp" />);

    // Import within the test to avoid hoisting issues
    const { KeysakoButton: CoreButton } = jest.requireMock('@keysako-identity/core');
    expect(CoreButton).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: defaultProps.clientId,
        redirectUri: defaultProps.redirectUri,
        theme: 'dark',
        shape: 'sharp',
      })
    );
  });

  it('applies additional className and style props', () => {
    const customClassName = 'custom-class';
    const customStyle = { margin: '10px' };

    const { container } = render(
      <KeysakoButton {...defaultProps} className={customClassName} style={customStyle} />
    );

    const buttonContainer = container.querySelector('div[data-keysako-button="true"]');
    expect(buttonContainer).toBeInTheDocument();
    expect(buttonContainer).toHaveClass(customClassName);
    expect(buttonContainer).toHaveStyle(customStyle);
  });

  it('handles auth complete success events', () => {
    const onSuccess = jest.fn();
    render(<KeysakoButton {...defaultProps} onSuccess={onSuccess} />);

    // Simulate auth complete event
    const successEvent = new CustomEvent('keysako:auth_complete', {
      detail: { success: true, tokens: { accessToken: 'test-token' } },
    });
    window.dispatchEvent(successEvent);

    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        tokens: expect.objectContaining({ accessToken: 'test-token' }),
      })
    );
  });

  it('handles auth complete error events', () => {
    const onError = jest.fn();
    render(<KeysakoButton {...defaultProps} onError={onError} />);

    // Simulate auth error event
    const errorEvent = new CustomEvent('keysako:auth_complete', {
      detail: { success: false, error: 'Authentication failed' },
    });
    window.dispatchEvent(errorEvent);

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Authentication failed' })
    );
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = render(<KeysakoButton {...defaultProps} />);
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keysako:auth_complete',
      expect.any(Function)
    );
  });
});
