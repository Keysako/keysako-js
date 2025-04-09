import { IdentityProvider } from './IdentityProvider';
import { buttonThemes } from './themes';
import { TokenManager } from './TokenManager';
import { KeysakoButtonOptions, AuthEvents, AuthResult } from './types';
import { getContrastColor } from './utils';

/**
 * SVG logo for the Keysako button
 */
export const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
  <path d="M12 8v8M8 12h8"/>
</svg>`;

/**
 * Button text translations
 */
export interface ButtonText {
  signIn: string;
  signOut: string;
  ageFormat: string;
  isRTL: boolean;
}

/**
 * Get button text based on locale
 * @param locale Locale string
 * @returns Button text translations
 */
export function getButtonText(locale: string): ButtonText {
  // Default to English
  const defaultText: ButtonText = {
    signIn: 'Sign in with Keysako',
    signOut: 'Sign out',
    ageFormat: '{age}+',
    isRTL: false,
  };

  // Extract language code
  const lang = locale.split('-')[0].toLowerCase();

  // Add more languages as needed
  const translations: Record<string, ButtonText> = {
    en: defaultText,
    fr: {
      signIn: 'Se connecter avec Keysako',
      signOut: 'Se déconnecter',
      ageFormat: '{age}+',
      isRTL: false,
    },
    es: {
      signIn: 'Iniciar sesión con Keysako',
      signOut: 'Cerrar sesión',
      ageFormat: '{age}+',
      isRTL: false,
    },
    de: {
      signIn: 'Mit Keysako anmelden',
      signOut: 'Abmelden',
      ageFormat: '{age}+',
      isRTL: false,
    },
    ar: {
      signIn: 'تسجيل الدخول باستخدام Keysako',
      signOut: 'تسجيل الخروج',
      ageFormat: '+{age}',
      isRTL: true,
    },
  };

  return translations[lang] || defaultText;
}

/**
 * Core KeysakoButton class
 * This class provides the core functionality for the Keysako button
 * Framework-specific implementations will extend this class
 */
export class KeysakoButton {
  private options: KeysakoButtonOptions;
  private provider: IdentityProvider | null = null;
  private tokenManager: TokenManager;
  private element: HTMLElement | null = null;

  /**
   * Create a new KeysakoButton
   * @param options Button options
   */
  constructor(options: KeysakoButtonOptions) {
    this.options = {
      theme: 'default',
      shape: 'rounded',
      logoOnly: false,
      usePopup: false,
      ...options,
    };

    if (!this.options.clientId) {
      throw new Error('KeysakoButton: clientId is required');
    }

    this.tokenManager = TokenManager.getInstance();
    this.initializeProvider();
  }

  /**
   * Initialize the identity provider
   */
  private initializeProvider(): void {
    this.provider = IdentityProvider.initialize({
      clientId: this.options.clientId,
      redirectUri: this.options.redirectUri,
      age: this.options.age,
      usePopup: this.options.usePopup,
      onAuthComplete: (result: AuthResult) => {
        this.handleAuthResult(result);
      },
    });
  }

  /**
   * Handle authentication result
   * @param result Authentication result
   */
  private handleAuthResult(result: AuthResult): void {
    if (result.success) {
      if (this.options.onSuccess) {
        this.options.onSuccess(result);
      }
    } else {
      if (this.options.onError) {
        this.options.onError({ error: result.error || 'Unknown error' });
      }
    }

    // Update the button state
    this.updateButtonState();
  }

  /**
   * Create the button element
   * @returns HTML element for the button
   */
  createButtonElement(): HTMLElement {
    const button = document.createElement('button');
    button.className = 'keysako-button';

    if (this.options.logoOnly) {
      button.classList.add('logo-only');
    }

    // Get language preference
    const userLang = this.options.locale || navigator.language || 'en';
    const buttonText = getButtonText(userLang);

    // Handle RTL languages
    if (buttonText.isRTL) {
      button.setAttribute('dir', 'rtl');
      button.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    }

    // Add the logo SVG
    const logoContainer = document.createElement('span');
    logoContainer.className = 'keysako-button-logo';
    logoContainer.innerHTML = logoSvg;

    // For RTL languages, add logo at the end
    if (!this.options.logoOnly) {
      if (buttonText.isRTL) {
        const text = document.createElement('span');
        text.className = 'keysako-button-text';
        text.textContent = this.tokenManager.hasValidAccessToken()
          ? buttonText.signOut
          : buttonText.signIn;
        button.appendChild(text);
        button.appendChild(logoContainer);
      } else {
        button.appendChild(logoContainer);
        const text = document.createElement('span');
        text.className = 'keysako-button-text';
        text.textContent = this.tokenManager.hasValidAccessToken()
          ? buttonText.signOut
          : buttonText.signIn;
        button.appendChild(text);
      }
    } else {
      button.appendChild(logoContainer);
    }

    // Add age badge if specified
    if (this.options.age) {
      const badge = document.createElement('span');
      badge.className = 'keysako-button-age-badge';
      badge.textContent = buttonText.ageFormat.replace('{age}', String(this.options.age));
      button.appendChild(badge);
    }

    // Apply theme
    this.applyTheme(button);

    // Add click handler
    button.addEventListener('click', this.handleClick.bind(this));

    // Store the element reference
    this.element = button;

    // Listen for token events
    window.addEventListener(AuthEvents.TOKENS_UPDATED, () => this.updateButtonState());
    window.addEventListener(AuthEvents.TOKENS_CLEARED, () => this.updateButtonState());

    return button;
  }

  /**
   * Apply theme to the button
   * @param button Button element
   */
  private applyTheme(button: HTMLElement): void {
    const theme = buttonThemes[this.options.theme as string] || buttonThemes.default;

    // Apply CSS variables
    button.style.setProperty('--keysako-btn-bg', theme.background);
    button.style.setProperty('--keysako-btn-color', theme.color);
    button.style.setProperty('--keysako-btn-border', theme.border);
    button.style.setProperty('--keysako-btn-hover-bg', theme.hoverBg);
    button.style.setProperty('--keysako-btn-shadow', theme.shadow);

    // In logo-only mode and rounded shape, use a perfect circle
    const radius =
      this.options.logoOnly && this.options.shape === 'rounded'
        ? '50%'
        : this.options.shape === 'rounded'
        ? '6px'
        : '0';
    button.style.setProperty('--keysako-btn-radius', radius);

    // Set badge colors based on the theme
    if (this.options.theme === 'light') {
      button.style.setProperty('--keysako-badge-bg', '#000');
      button.style.setProperty('--keysako-badge-color', '#fff');
    } else if (this.options.theme === 'dark') {
      button.style.setProperty('--keysako-badge-bg', '#fff');
      button.style.setProperty('--keysako-badge-color', '#000');
    } else {
      // For the default theme (purple) and others
      // Use a contrasting color with the button background
      const bgColor = theme.background.includes('linear-gradient')
        ? '#000' // For gradients, use black
        : getContrastColor(theme.background);
      const textColor = bgColor === '#000' ? '#fff' : '#000';

      button.style.setProperty('--keysako-badge-bg', bgColor);
      button.style.setProperty('--keysako-badge-color', textColor);
    }

    if (theme.backdropFilter) {
      button.style.setProperty('--keysako-btn-backdrop-filter', theme.backdropFilter);
    }

    if (theme.textShadow) {
      button.style.setProperty('--keysako-btn-text-shadow', theme.textShadow);
    }
  }

  /**
   * Handle button click
   */
  private handleClick(): void {
    if (!this.provider) {
      console.error('KeysakoButton: Provider not initialized');
      return;
    }

    if (this.tokenManager.hasValidAccessToken()) {
      this.provider.logout();
    } else {
      this.provider.login();
    }
  }

  /**
   * Update the button state based on authentication status
   */
  private updateButtonState(): void {
    if (!this.element) return;

    const userLang = this.options.locale || navigator.language || 'en';
    const buttonText = getButtonText(userLang);

    const textElement = this.element.querySelector('.keysako-button-text');
    if (textElement) {
      textElement.textContent = this.tokenManager.hasValidAccessToken()
        ? buttonText.signOut
        : buttonText.signIn;
    }
  }

  /**
   * Get CSS styles for the button
   * @returns CSS styles as a string
   */
  getStyles(): string {
    return `
      .keysako-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 8px 16px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        font-weight: 500;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
        
        background: var(--keysako-btn-bg);
        color: var(--keysako-btn-color);
        border: var(--keysako-btn-border);
        box-shadow: var(--keysako-btn-shadow);
        border-radius: var(--keysako-btn-radius);
        backdrop-filter: var(--keysako-btn-backdrop-filter);
        text-shadow: var(--keysako-btn-text-shadow);
      }

      .keysako-button-logo svg {
        display: block;
        width: 24px;
        height: 24px;
        stroke: currentColor;
        margin: 0;
        padding: 0;
      }

      .keysako-button:not(.logo-only) .keysako-button-logo svg {
        width: 18px;
        height: 18px;
        margin-right: 8px;
      }

      .keysako-button.logo-only {
        padding: 8px;
        width: 40px;
        height: 40px;
        aspect-ratio: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      
      .keysako-button:hover {
        background: var(--keysako-btn-hover-bg);
      }
      
      .keysako-button-age-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 2px 6px;
        font-size: 12px;
        font-weight: 600;
        margin-left: 8px;
        background: var(--keysako-badge-bg);
        color: var(--keysako-badge-color);
        border-radius: 9999px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        line-height: 1;
      }

      .keysako-button.logo-only .keysako-button-age-badge {
        position: absolute;
        top: -6px;
        right: -6px;
        margin: 0;
        min-width: 18px;
        height: 18px;
        padding: 2px 4px;
        font-size: 10px;
      }
    `;
  }
}
