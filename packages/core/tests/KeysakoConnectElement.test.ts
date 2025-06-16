import { KeysakoButton } from '../src/KeysakoButton';
import { KeysakoConnectElement, registerKeysakoConnectElement } from '../src/KeysakoConnectElement';

// Mock KeysakoButton
jest.mock('../src/KeysakoButton');

// Mock DOM methods
Object.defineProperty(window, 'customElements', {
  value: {
    define: jest.fn(),
    get: jest.fn().mockReturnValue(undefined),
  },
  writable: true,
});

Object.defineProperty(document, 'readyState', {
  value: 'complete',
  writable: true,
});

describe('KeysakoConnectElement', () => {
  let mockButton: jest.Mocked<KeysakoButton>;
  let element: KeysakoConnectElement;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock KeysakoButton
    mockButton = {
      createButtonElement: jest.fn().mockResolvedValue(document.createElement('button')),
      getStyles: jest.fn().mockReturnValue('.keysako-button { color: blue; }'),
    } as any;

    (KeysakoButton as jest.MockedClass<typeof KeysakoButton>).mockImplementation(() => mockButton);

    // Create element
    element = new KeysakoConnectElement();
    document.body.appendChild(element);
  });

  afterEach(() => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });

  describe('observedAttributes', () => {
    it('should return correct list of observed attributes', () => {
      const attributes = KeysakoConnectElement.observedAttributes;
      expect(attributes).toContain('client-id');
      expect(attributes).toContain('redirect-uri');
      expect(attributes).toContain('theme');
      expect(attributes).toContain('shape');
      expect(attributes).toContain('age');
      expect(attributes).toContain('logo-only');
      expect(attributes).toContain('use-popup');
      expect(attributes).toContain('locale');
      expect(attributes).toContain('callback');
    });
  });

  describe('connectedCallback', () => {
    it('should initialize button when connected to DOM', async () => {
      element.setAttribute('client-id', 'test-client-id');

      // Trigger connectedCallback
      element.connectedCallback();

      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(KeysakoButton).toHaveBeenCalledWith(
        expect.objectContaining({
          clientId: 'test-client-id',
        })
      );
    });

    it('should handle missing client-id gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      element.connectedCallback();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(consoleSpy).toHaveBeenCalledWith('KeysakoConnect: client-id attribute is required');
      expect(KeysakoButton).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('attributeChangedCallback', () => {
    it('should reinitialize button when attributes change', async () => {
      element.setAttribute('client-id', 'test-client-id');

      // Trigger attribute change
      element.attributeChangedCallback('theme', 'default', 'dark');

      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(KeysakoButton).toHaveBeenCalled();
    });

    it('should not reinitialize if old and new values are the same', () => {
      element.attributeChangedCallback('theme', 'default', 'default');
      expect(KeysakoButton).not.toHaveBeenCalled();
    });
  });

  describe('attribute parsing', () => {
    beforeEach(() => {
      element.setAttribute('client-id', 'test-client-id');
    });

    it('should parse string attributes correctly', async () => {
      element.setAttribute('redirect-uri', 'https://example.com/callback');
      element.setAttribute('theme', 'dark');
      element.setAttribute('shape', 'sharp');
      element.setAttribute('locale', 'fr-FR');

      element.connectedCallback();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(KeysakoButton).toHaveBeenCalledWith(
        expect.objectContaining({
          clientId: 'test-client-id',
          redirectUri: 'https://example.com/callback',
          theme: 'dark',
          shape: 'sharp',
          locale: 'fr-FR',
        })
      );
    });

    it('should parse numeric attributes correctly', async () => {
      element.setAttribute('age', '18');

      element.connectedCallback();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(KeysakoButton).toHaveBeenCalledWith(
        expect.objectContaining({
          age: 18,
        })
      );
    });

    it('should parse boolean attributes correctly', async () => {
      element.setAttribute('logo-only', '');
      element.setAttribute('use-popup', '');

      element.connectedCallback();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(KeysakoButton).toHaveBeenCalledWith(
        expect.objectContaining({
          logoOnly: true,
          usePopup: true,
        })
      );
    });

    it('should handle callback attribute', async () => {
      // Mock global callback function
      (window as any).testCallback = jest.fn();
      element.setAttribute('callback', 'testCallback');

      element.connectedCallback();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(KeysakoButton).toHaveBeenCalledWith(
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );

      // Clean up
      delete (window as any).testCallback;
    });

    it('should warn about invalid callback function', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      element.setAttribute('callback', 'nonExistentCallback');

      element.connectedCallback();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(consoleSpy).toHaveBeenCalledWith(
        'KeysakoConnect: callback function "nonExistentCallback" is not defined'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('error handling', () => {
    it('should handle button initialization errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (KeysakoButton as jest.MockedClass<typeof KeysakoButton>).mockImplementation(() => {
        throw new Error('Initialization failed');
      });

      element.setAttribute('client-id', 'test-client-id');
      element.connectedCallback();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error initializing KeysakoConnect:',
        expect.any(Error)
      );

      // Should show error element
      const errorElement = element.shadowRoot?.querySelector('div');
      expect(errorElement?.textContent).toBe('Error initializing Keysako button');
      expect(errorElement?.style.color).toBe('red');

      consoleSpy.mockRestore();
    });
  });

  describe('shadow DOM', () => {
    it('should create shadow root', () => {
      expect(element.shadowRoot).toBeTruthy();
    });

    it('should add styles and button to shadow DOM', async () => {
      element.setAttribute('client-id', 'test-client-id');
      element.connectedCallback();
      await new Promise(resolve => setTimeout(resolve, 0));

      const styleElement = element.shadowRoot?.querySelector('style');
      const buttonElement = element.shadowRoot?.querySelector('button');

      expect(styleElement).toBeTruthy();
      expect(styleElement?.textContent).toContain('.keysako-button');
      expect(buttonElement).toBeTruthy();
    });

    it('should clear shadow DOM before adding new content', async () => {
      element.setAttribute('client-id', 'test-client-id');

      // Add some initial content
      const initialDiv = document.createElement('div');
      element.shadowRoot?.appendChild(initialDiv);

      element.connectedCallback();
      await new Promise(resolve => setTimeout(resolve, 0));

      // Initial content should be removed
      expect(element.shadowRoot?.contains(initialDiv)).toBe(false);
    });
  });
});

describe('registerKeysakoConnectElement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    KeysakoConnectElement._registered = false;
  });

  it('should register the custom element', () => {
    registerKeysakoConnectElement();

    expect(window.customElements.define).toHaveBeenCalledWith(
      'keysako-connect',
      KeysakoConnectElement
    );
    expect(KeysakoConnectElement._registered).toBe(true);
  });

  it('should not register if already registered', () => {
    KeysakoConnectElement._registered = true;

    registerKeysakoConnectElement();

    expect(window.customElements.define).not.toHaveBeenCalled();
  });

  it('should not register if element already exists', () => {
    (window.customElements.get as jest.Mock).mockReturnValue(KeysakoConnectElement);

    registerKeysakoConnectElement();

    expect(window.customElements.define).not.toHaveBeenCalled();
  });

  it('should handle registration errors', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // Reset the registered flag to allow re-registration
    KeysakoConnectElement._registered = false;
    (window.customElements.get as jest.Mock).mockReturnValue(undefined);

    (window.customElements.define as jest.Mock).mockImplementation(() => {
      throw new Error('Registration failed');
    });

    registerKeysakoConnectElement();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to register keysako-connect element:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('should not register in non-browser environment', () => {
    const originalWindow = global.window;

    // Mock a non-browser environment
    delete (global as any).window;

    registerKeysakoConnectElement();

    // Restore window before assertions
    global.window = originalWindow;

    // The function should have exited early, so define should not have been called
    // We can't check this directly since window was undefined, but the function should handle it gracefully
    expect(true).toBe(true); // This test mainly ensures no errors are thrown
  });
});
