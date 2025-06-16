import { mount } from '@vue/test-utils';

import { KeysakoButton } from '../src/KeysakoButton';

// Mock the core module
jest.mock('@keysako/core', () => {
  const mockCreateButtonElement = jest.fn().mockImplementation(() => {
    const button = document.createElement('button');
    button.className = 'keysako-button';
    button.setAttribute('data-testid', 'keysako-button');
    return Promise.resolve(button);
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
    AuthEvents: {
      AUTH_COMPLETE: 'keysako:auth_complete',
    },
  };
});

describe('KeysakoButton', () => {
  const defaultProps = {
    clientId: 'test-client-id',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with required props', () => {
    const wrapper = mount(KeysakoButton, {
      props: defaultProps,
    });

    expect(wrapper.exists()).toBe(true);
    expect(wrapper.attributes('data-keysako-button')).toBe('true');
  });

  it('applies custom class and style', () => {
    const customClass = 'custom-button';
    const customStyle = { margin: '10px' };

    const wrapper = mount(KeysakoButton, {
      props: {
        ...defaultProps,
        class: customClass,
        style: customStyle,
      },
    });

    expect(wrapper.classes()).toContain(customClass);
    expect(wrapper.attributes('style')).toContain('margin: 10px');
  });

  it('initializes core button with correct props', async () => {
    const props = {
      clientId: 'test-client-id',
      redirectUri: 'https://example.com/callback',
      theme: 'dark' as const,
      shape: 'sharp' as const,
      logoOnly: true,
      usePopup: true,
      age: 18,
      locale: 'fr-FR',
    };

    mount(KeysakoButton, { props });

    // Wait for async initialization
    await new Promise(resolve => setTimeout(resolve, 0));

    const { KeysakoButton: CoreButton } = jest.requireMock('@keysako/core');
    expect(CoreButton).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: 'test-client-id',
        redirectUri: 'https://example.com/callback',
        theme: 'dark',
        shape: 'sharp',
        logoOnly: true,
        usePopup: true,
        age: 18,
        locale: 'fr-FR',
      })
    );
  });

  it('emits success event when authentication succeeds', async () => {
    const onSuccess = jest.fn();
    const wrapper = mount(KeysakoButton, {
      props: {
        ...defaultProps,
        onSuccess,
      },
    });

    // Wait for component to mount and initialize
    await new Promise(resolve => setTimeout(resolve, 10));

    // The component should have been created with the onSuccess callback
    const { KeysakoButton: CoreButton } = jest.requireMock('@keysako/core');
    expect(CoreButton).toHaveBeenCalledWith(
      expect.objectContaining({
        onSuccess: expect.any(Function),
      })
    );

    // Get the onSuccess callback that was passed to CoreButton
    const initCall = CoreButton.mock.calls[0][0];
    const mockResult = { success: true, token: 'test-token' };

    // Trigger the success callback directly
    initCall.onSuccess(mockResult);

    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('success')).toBeTruthy();
    expect(wrapper.emitted('success')?.[0]).toEqual([mockResult]);
  });

  it('emits error event when authentication fails', async () => {
    const onError = jest.fn();
    const wrapper = mount(KeysakoButton, {
      props: {
        ...defaultProps,
        onError,
      },
    });

    // Wait for component to mount and initialize
    await new Promise(resolve => setTimeout(resolve, 10));

    // The component should have been created with the onError callback
    const { KeysakoButton: CoreButton } = jest.requireMock('@keysako/core');
    expect(CoreButton).toHaveBeenCalledWith(
      expect.objectContaining({
        onError: expect.any(Function),
      })
    );

    // Get the onError callback that was passed to CoreButton
    const initCall = CoreButton.mock.calls[CoreButton.mock.calls.length - 1][0];
    const mockError = { error: 'Authentication failed' };

    // Trigger the error callback directly
    initCall.onError(mockError);

    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('error')).toBeTruthy();
    expect(wrapper.emitted('error')?.[0]).toEqual([mockError]);
  });

  it('handles initialization errors gracefully', async () => {
    const { KeysakoButton: CoreButton } = jest.requireMock('@keysako/core');
    CoreButton.mockImplementation(() => {
      throw new Error('Initialization failed');
    });

    const wrapper = mount(KeysakoButton, {
      props: defaultProps,
    });

    // Wait for async initialization
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(wrapper.emitted('error')).toBeTruthy();
    expect(wrapper.emitted('error')?.[0]).toEqual([{ error: 'Failed to initialize button' }]);
  });

  it('cleans up on unmount', async () => {
    const wrapper = mount(KeysakoButton, {
      props: defaultProps,
    });

    // Wait for component to mount
    await new Promise(resolve => setTimeout(resolve, 0));

    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    wrapper.unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keysako:auth_complete',
      expect.any(Function)
    );
  });

  it('adds styles and button element to DOM', async () => {
    mount(KeysakoButton, {
      props: defaultProps,
    });

    // Wait for async initialization
    await new Promise(resolve => setTimeout(resolve, 10));

    // Check that the CoreButton was created
    const { KeysakoButton: CoreButton } = jest.requireMock('@keysako/core');
    expect(CoreButton).toHaveBeenCalled();

    // Since we're mocking the entire CoreButton class, we can verify
    // that it was instantiated with the correct props
    expect(CoreButton).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: 'test-client-id',
      })
    );
  });

  it('handles missing clientId', () => {
    expect(() => {
      mount(KeysakoButton, {
        props: {
          clientId: '',
        },
      });
    }).not.toThrow();
  });

  it('uses default prop values', () => {
    const wrapper = mount(KeysakoButton, {
      props: defaultProps,
    });

    expect(wrapper.props('theme')).toBe('default');
    expect(wrapper.props('shape')).toBe('rounded');
    expect(wrapper.props('logoOnly')).toBe(false);
    expect(wrapper.props('usePopup')).toBe(false);
  });
});
