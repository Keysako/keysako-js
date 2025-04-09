/**
 * Button theme interface
 */
export interface ButtonThemeStyles {
  background: string;
  color: string;
  border: string;
  hoverBg: string;
  shadow: string;
  backdropFilter?: string;
  textShadow?: string;
}

/**
 * Button themes
 */
export const buttonThemes: Record<string, ButtonThemeStyles> = {
  default: {
    background: 'linear-gradient(135deg, #6e8efb, #a777e3)',
    color: '#fff',
    border: 'none',
    hoverBg: 'linear-gradient(135deg, #5d7df9, #9566d9)',
    shadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
  },
  light: {
    background: '#ffffff',
    color: '#757575',
    border: '1px solid #dadce0',
    hoverBg: '#f8f8f8',
    shadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
  },
  dark: {
    background: '#202124',
    color: '#ffffff',
    border: '1px solid #5f6368',
    hoverBg: '#303134',
    shadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
  },
};

/**
 * Get CSS styles for a button
 * @returns CSS styles as a string
 */
export function getButtonStyles(): string {
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
