import { KeysakoButton } from './KeysakoButton';
import { KeysakoButtonOptions, ButtonTheme, ButtonShape, AuthResult } from './types';

/**
 * Options pour le bouton Keysako
 */
interface KeysakoConnectOptions extends KeysakoButtonOptions {
  clientId: string;
  redirectUri?: string;
  theme?: ButtonTheme;
  shape?: ButtonShape;
  age?: number;
  logoOnly?: boolean;
  usePopup?: boolean;
  locale?: string;
  onSuccess?: (result: AuthResult) => void;
  onError?: (error: any) => void;
}

/**
 * Custom element for Keysako authentication button
 */
export class KeysakoConnectElement extends HTMLElement {
  private _button: KeysakoButton | null = null;
  private _shadow: ShadowRoot;
  public static _registered = false;

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  /**
   * List of attributes to observe for changes
   */
  static get observedAttributes(): string[] {
    return [
      'client-id',
      'redirect-uri',
      'theme',
      'shape',
      'age',
      'logo-only',
      'use-popup',
      'locale',
      'callback'
    ];
  }

  /**
   * Called when the element is connected to the DOM
   */
  connectedCallback(): void {
    this._initButton();
  }

  /**
   * Called when an observed attribute changes
   */
  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    if (oldValue !== newValue) {
      this._initButton();
    }
  }

  /**
   * Initialize the Keysako button
   */
  private _initButton(): void {
    try {
      // Get attributes
      const clientId = this.getAttribute('client-id');
      const redirectUri = this.getAttribute('redirect-uri');
      const theme = this.getAttribute('theme') || 'default';
      const shape = this.getAttribute('shape') || 'rounded';
      const age = this.getAttribute('age') ? parseInt(this.getAttribute('age')!) : undefined;
      const logoOnly = this.hasAttribute('logo-only');
      const usePopup = this.hasAttribute('use-popup');
      const locale = this.getAttribute('locale');
      const callback = this.getAttribute('callback');

      // Check if client-id is defined
      if (!clientId) {
        console.warn('KeysakoConnect: client-id attribute is required');
        return;
      }

      // Create options for KeysakoButton
      const options: KeysakoConnectOptions = {
        clientId,
        redirectUri: redirectUri || undefined,
        theme: theme as ButtonTheme,
        shape: shape as ButtonShape,
        age,
        logoOnly,
        usePopup,
        locale: locale || undefined
      };

      // Add callback if specified
      if (callback && typeof window !== 'undefined') {
        const callbackFn = (window as any)[callback];
        if (typeof callbackFn === 'function') {
          options.onSuccess = (result: AuthResult) => {
            if (typeof (window as any)[callback] === 'function') {
              (window as any)[callback](result);
            }
          };
          options.onError = (error: any) => {
            console.error('Keysako authentication error:', error);
            if (typeof (window as any)[callback] === 'function') {
              (window as any)[callback]({ error });
            }
          };
        } else {
          console.warn(`KeysakoConnect: callback function "${callback}" is not defined`);
        }
      }

      // Create KeysakoButton instance
      this._button = new KeysakoButton(options);

      // Clear shadow DOM
      while (this._shadow.firstChild) {
        this._shadow.removeChild(this._shadow.firstChild);
      }

      // Add styles
      const style = document.createElement('style');
      style.textContent = this._button.getStyles();
      this._shadow.appendChild(style);

      // Add button element
      const buttonElement = this._button.createButtonElement();
      this._shadow.appendChild(buttonElement);
    } catch (error) {
      console.error('Error initializing KeysakoConnect:', error);
      // Afficher un message d'erreur dans le composant
      const errorElement = document.createElement('div');
      errorElement.style.color = 'red';
      errorElement.style.padding = '10px';
      errorElement.style.border = '1px solid red';
      errorElement.style.borderRadius = '4px';
      errorElement.textContent = 'Error initializing Keysako button';
      
      // Clear shadow DOM
      while (this._shadow.firstChild) {
        this._shadow.removeChild(this._shadow.firstChild);
      }
      
      this._shadow.appendChild(errorElement);
    }
  }
}

/**
 * Register the custom element if it hasn't been registered yet
 */
export function registerKeysakoConnectElement(): void {
  if (typeof window !== 'undefined') {
    try {
      if (!customElements.get('keysako-connect') && !KeysakoConnectElement._registered) {
        customElements.define('keysako-connect', KeysakoConnectElement);
        KeysakoConnectElement._registered = true;
      }
    } catch (error) {
      console.error('Failed to register keysako-connect element:', error);
    }
  }
}

// Auto-register the element if in browser environment
if (typeof window !== 'undefined') {
  // Use setTimeout to ensure this runs after the document is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      registerKeysakoConnectElement();
    });
  } else {
    registerKeysakoConnectElement();
  }
}
