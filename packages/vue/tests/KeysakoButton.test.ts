import { mount } from '@vue/test-utils';
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
    redirectUri: 'https://example.com/callback'
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
  });
  
  it('renders the button with correct attributes', () => {
    const wrapper = mount(KeysakoButton, {
      props: defaultProps
    });
    
    // Check that the component renders a div with data-keysako-button attribute
    const buttonContainer = wrapper.find('[data-keysako-button]');
    expect(buttonContainer.exists()).toBe(true);
  });
  
  it('creates a button element when mounted', async () => {
    // Mount the component
    mount(KeysakoButton, {
      props: defaultProps
    });
    
    // The button is created and appended to the DOM in the mounted hook
    // We need to wait for the next tick for the DOM to update
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Check that the button was created
    const buttonElements = document.querySelectorAll('[data-keysako-button]');
    expect(buttonElements.length).toBeGreaterThan(0);
  });
  
  it('passes props to the IdentityProvider', () => {
    mount(KeysakoButton, {
      props: {
        ...defaultProps,
        theme: 'dark',
        shape: 'circle',
        logoOnly: true,
        usePopup: true,
        age: 18,
        locale: 'fr'
      }
    });
    
    const mockIdentityProvider = IdentityProvider as jest.Mock;
    const mockConfig = mockIdentityProvider.mock.calls[0][0];
    
    expect(mockConfig.clientId).toBe(defaultProps.clientId);
    expect(mockConfig.redirectUri).toBe(defaultProps.redirectUri);
    expect(mockConfig.theme).toBe('dark');
    expect(mockConfig.shape).toBe('circle');
    expect(mockConfig.logoOnly).toBe(true);
    expect(mockConfig.usePopup).toBe(true);
    expect(mockConfig.age).toBe(18);
    expect(mockConfig.locale).toBe('fr');
  });
  
  it('emits success event when authentication succeeds', async () => {
    const wrapper = mount(KeysakoButton, {
      props: defaultProps
    });
    
    // Simulate a successful authentication event
    const authCompleteEvent = new CustomEvent('keysako:auth_complete', {
      detail: { success: true, token: 'test-token' }
    });
    window.dispatchEvent(authCompleteEvent);
    
    // Wait for the event to be processed
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Check that the success event was emitted with the correct payload
    expect(wrapper.emitted().success).toBeTruthy();
    expect(wrapper.emitted().success[0][0]).toEqual({ success: true, token: 'test-token' });
  });
  
  it('emits error event when authentication fails', async () => {
    const wrapper = mount(KeysakoButton, {
      props: defaultProps
    });
    
    // Simulate a failed authentication event
    const authCompleteEvent = new CustomEvent('keysako:auth_complete', {
      detail: { success: false, error: 'Authentication failed' }
    });
    window.dispatchEvent(authCompleteEvent);
    
    // Wait for the event to be processed
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Check that the error event was emitted with the correct payload
    expect(wrapper.emitted().error).toBeTruthy();
    expect(wrapper.emitted().error[0][0]).toEqual({ error: 'Authentication failed' });
  });
  
  it('cleans up event listeners when unmounted', async () => {
    // Mock addEventListener and removeEventListener
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    
    const wrapper = mount(KeysakoButton, {
      props: defaultProps
    });
    
    // Check that event listener was added
    expect(addEventListenerSpy).toHaveBeenCalled();
    
    // Unmount the component
    wrapper.unmount();
    
    // Check that event listener was removed
    expect(removeEventListenerSpy).toHaveBeenCalled();
    
    // Restore the original methods
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});
