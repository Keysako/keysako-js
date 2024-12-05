import { IdentityProvider } from './identity-provider.js';
import { TokenManager } from './token-manager.js';
import { buttonThemes, ButtonTheme } from './button-themes.js';
import { logoSvg } from './logo.js';
import { getButtonText } from './translations.js';

/**
 * Interface for authentication result
 */
export interface AuthResult {
    /** Whether the authentication was successful */
    success: boolean;
    /** Access token (only present if success is true) */
    token?: string;
    /** Whether the age requirement was met (if age verification was requested) */
    hasRequiredAge?: boolean;
    /** Error message (only present if success is false) */
    error?: string;
}

/**
 * Custom element for Keysako authentication
 * @element keysako-connect
 * @attr {string} client-id - Your Keysako client ID
 * @attr {string} redirect-uri - The URI where users will be redirected after authentication
 * @attr {string} [theme=default] - Button theme ('default', 'light', or 'dark')
 * @attr {string} [age] - Display an age badge on the button
 * @attr {string} [shape=rounded] - Button shape ('rounded' or 'sharp')
 * @attr {boolean} [logo-only] - Display only the logo without text
 * @attr {boolean} [popup] - Use popup mode for authentication
 * @attr {string} [callback] - Name of the callback function to handle authentication results
 * @attr {string} [lang] - Force a specific language (overrides browser language)
 * @fires keysako:auth_complete - Fired when authentication is complete
 * @fires keysako:tokens_updated - Fired when tokens are updated
 * @fires keysako:tokens_cleared - Fired when tokens are cleared
 */
export class IdentityButton extends HTMLElement {
    private buttonContainer!: HTMLDivElement;
    private provider: any;
    private tokenManager: TokenManager;
    private theme: ButtonTheme = 'default';
    private shape: 'rounded' | 'sharp' = 'rounded';
    private _callback: ((result: AuthResult) => void) | null = null;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.tokenManager = TokenManager.getInstance();
    }

    static get observedAttributes() {
        return [
            'client-id',
            'redirect-uri',
            'theme',
            'age',
            'logo-only',
            'shape',
            'popup',
            'callback',
            'lang'
        ];
    }

    get callback(): ((result: AuthResult) => void) | null {
        return this._callback;
    }

    set callback(value: ((result: AuthResult) => void) | null) {
        this._callback = value;
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === 'callback' && newValue) {
            // If the callback is defined as an attribute, retrieve it from the window
            const globalCallback = (window as any)[newValue];
            if (typeof globalCallback === 'function') {
                this._callback = globalCallback;
            } else {
                console.warn(`Callback function "${newValue}" not found in global scope`);
            }
        } else if (name === 'theme' && newValue && oldValue !== newValue) {
            this.theme = newValue as ButtonTheme;
            this.applyTheme();
        } else if (name === 'shape' && newValue && oldValue !== newValue) {
            this.shape = newValue as 'rounded' | 'sharp';
            this.applyTheme();
        }
        this.updateComponent();
    }

    connectedCallback() {
        this.render();
        const clientId = this.getAttribute('client-id');
        if (!clientId) {
            console.error('IdentityButton: client-id attribute is required');
            return;
        }

        const age = this.getAttribute('age');
        if (age && isNaN(parseInt(age))) {
            console.error('IdentityButton: age attribute must be a number');
            return;
        }

        const initialTheme = this.getAttribute('theme') as ButtonTheme;
        const initialShape = this.getAttribute('shape') as 'rounded' | 'sharp';
        
        if (initialTheme) {
            this.theme = initialTheme;
        }
        if (initialShape) {
            this.shape = initialShape;
        }
        this.applyTheme();

        // Auto-initialize the provider
        import('./identity-provider.js').then(({ IdentityProvider }) => {
            this.provider = IdentityProvider.initialize({
                clientId: clientId,
                redirectUri: this.getAttribute('redirect-uri') || undefined,
                age: age ? parseInt(age) : undefined,
                usePopup: this.hasAttribute('popup'),
                onAuthComplete: (result) => {
                    this.handleAuthResult(result);
                }
            });

            // Listen for token changes
            window.addEventListener('keysako:tokens_updated', () => this.render());
            window.addEventListener('keysako:tokens_cleared', () => this.render());
        });
    }

    private handleAuthResult(result: AuthResult) {
        // Emit the event for backwards compatibility
        const event = new CustomEvent('keysako:auth_complete', {
            detail: result,
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(event);

        // Call the callback if it exists
        if (this._callback) {
            try {
                this._callback(result);
            } catch (error) {
                console.error('Error in callback:', error);
            }
        }
    }

    private render() {
        if (!this.shadowRoot) return;

        const style = document.createElement('style');
        const theme = this.getAttribute('theme') as ButtonTheme || 'default';
        style.textContent = this.getStyles(theme);
        this.shadowRoot.appendChild(style);

        if (this.buttonContainer) {
            this.shadowRoot.removeChild(this.buttonContainer);
        }
        
        this.buttonContainer = document.createElement('div');
        this.shadowRoot.appendChild(this.buttonContainer);

        const button = document.createElement('button');
        button.className = 'identity-button';
        if (this.hasAttribute('logo-only')) {
            button.classList.add('logo-only');
        }

        // Get language preference: forced language or browser language
        const forcedLang = this.getAttribute('lang');
        const userLang = forcedLang || navigator.language || 'en';
        const buttonText = getButtonText(userLang);
        
        // Handle RTL languages
        if (buttonText.isRTL) {
            button.setAttribute('dir', 'rtl');
            button.style.fontFamily = 'system-ui, -apple-system, sans-serif';
        }
        
        // Add the logo SVG
        const logoContainer = document.createElement('span');
        logoContainer.innerHTML = logoSvg;

        // For RTL languages, add logo at the end
        if (!this.hasAttribute('logo-only')) {
            if (buttonText.isRTL) {
                const text = document.createTextNode(this.tokenManager.hasValidAccessToken() ? buttonText.signOut : buttonText.signIn);
                button.appendChild(text);
                button.appendChild(logoContainer);
            } else {
                button.appendChild(logoContainer);
                const text = document.createTextNode(this.tokenManager.hasValidAccessToken() ? buttonText.signOut : buttonText.signIn);
                button.appendChild(text);
            }
        } else {
            button.appendChild(logoContainer);
        }
        
        const age = this.getAttribute('age');
        if (age) {
            const badge = document.createElement('span');
            badge.className = 'age-badge';
            badge.textContent = buttonText.ageFormat.replace('{age}', age);
            button.appendChild(badge);
        }

        button.addEventListener('click', () => {
            if (this.tokenManager.hasValidAccessToken()) {
                this.provider.logout();
            } else {
                this.provider.login();
            }
        });

        this.buttonContainer.appendChild(button);
    }

    private applyTheme() {
        const theme = buttonThemes[this.theme];
        if (!theme) return;

        this.style.setProperty('--keysako-btn-bg', theme.background);
        this.style.setProperty('--keysako-btn-color', theme.color);
        this.style.setProperty('--keysako-btn-border', theme.border);
        this.style.setProperty('--keysako-btn-hover-bg', theme.hoverBg);
        this.style.setProperty('--keysako-btn-shadow', theme.shadow);
        
        // In logo-only mode and rounded shape, use a perfect circle
        const radius = this.hasAttribute('logo-only') && this.shape === 'rounded' 
            ? '50%' 
            : this.shape === 'rounded' ? '6px' : '0';
        this.style.setProperty('--keysako-btn-radius', radius);

        // Set badge colors based on the theme
        if (this.theme === 'light') {
            this.style.setProperty('--keysako-badge-bg', '#000');
            this.style.setProperty('--keysako-badge-color', '#fff');
            this.style.setProperty('--keysako-badge-border', 'none');
        } else if (this.theme === 'dark') {
            this.style.setProperty('--keysako-badge-bg', '#fff');
            this.style.setProperty('--keysako-badge-color', '#000');
            this.style.setProperty('--keysako-badge-border', 'none');
        } else {
            // For the default theme (purple) and others
            // Use a contrasting color with the button background
            const bgColor = theme.background.includes('linear-gradient') 
                ? '#000' // For gradients, use black
                : this.getContrastColor(theme.background);
            const textColor = bgColor === '#000' ? '#fff' : '#000';
            
            this.style.setProperty('--keysako-badge-bg', bgColor);
            this.style.setProperty('--keysako-badge-color', textColor);
            this.style.setProperty('--keysako-badge-border', 'none');
        }
        
        if (theme.backdropFilter) {
            this.style.setProperty('--keysako-btn-backdrop-filter', theme.backdropFilter);
        } else {
            this.style.removeProperty('--keysako-btn-backdrop-filter');
        }
        
        if (theme.textShadow) {
            this.style.setProperty('--keysako-btn-text-shadow', theme.textShadow);
        } else {
            this.style.removeProperty('--keysako-btn-text-shadow');
        }
    }

    private getStyles(theme: ButtonTheme = 'light'): string {
        return `
            :host {
                display: inline-block;
            }
            
            .identity-button {
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

            .identity-button svg {
                display: block;
                width: 24px;
                height: 24px;
                stroke: currentColor;
                margin: 0;
                padding: 0;
            }

            .identity-button:not(.logo-only) svg {
                width: 18px;
                height: 18px;
                margin-right: 8px;
            }

            .identity-button.logo-only {
                padding: 8px;
                width: 40px;
                height: 40px;
                aspect-ratio: 1;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            
            .identity-button:hover {
                background: var(--keysako-btn-hover-bg);
            }
            
            .age-badge {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 2px 6px;
                font-size: 12px;
                font-weight: 600;
                margin-left: 8px;
                background: var(--keysako-badge-bg);
                color: var(--keysako-badge-color);
                border: var(--keysako-badge-border);
                border-radius: 9999px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                line-height: 1;
            }

            .identity-button.logo-only .age-badge {
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

    private getContrastColor(backgroundColor: string): string {
        // If it's a hexadecimal color
        if (backgroundColor.startsWith('#')) {
            const r = parseInt(backgroundColor.slice(1, 3), 16);
            const g = parseInt(backgroundColor.slice(3, 5), 16);
            const b = parseInt(backgroundColor.slice(5, 7), 16);
            
            // Calculate luminance (standard formula)
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            
            return luminance > 0.5 ? '#000' : '#fff';
        }
        
        // By default, return black
        return '#000';
    }

    private updateComponent() {
        this.render();
    }
}
