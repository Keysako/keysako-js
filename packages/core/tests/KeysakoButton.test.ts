import { IdentityProvider } from '../src/IdentityProvider';
import { KeysakoButton, getButtonText, logoSvg } from '../src/KeysakoButton';
import { TokenManager } from '../src/TokenManager';
import { KeysakoButtonOptions, AuthResult } from '../src/types';

// Mock dependencies
jest.mock('../src/IdentityProvider');
jest.mock('../src/TokenManager');

// Mock DOM methods
Object.defineProperty(window, 'navigator', {
  value: {
    language: 'en-US',
  },
  writable: true,
});

describe('KeysakoButton', () => {
  let mockProvider: jest.Mocked<IdentityProvider>;
  let mockTokenManager: jest.Mocked<TokenManager>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock TokenManager
    mockTokenManager = {
      hasValidAccessToken: jest.fn().mockResolvedValue(false),
      getAccessToken: jest.fn().mockResolvedValue(null),
      getIdToken: jest.fn().mockResolvedValue(null),
      clearTokens: jest.fn(),
      setTokens: jest.fn(),
    } as any;

    (TokenManager.getInstance as jest.Mock).mockReturnValue(mockTokenManager);

    // Mock IdentityProvider
    mockProvider = {
      login: jest.fn().mockResolvedValue({}),
      logout: jest.fn().mockResolvedValue({}),
      isAuthenticated: jest.fn().mockReturnValue(false),
      getAuthUrl: jest.fn().mockReturnValue('https://auth.keysako.com/oauth2/auth'),
    } as any;

    (IdentityProvider.initialize as jest.Mock).mockReturnValue(mockProvider);
  });

  describe('constructor', () => {
    it('should create a KeysakoButton with required options', () => {
      const options: KeysakoButtonOptions = {
        clientId: 'test-client-id',
      };

      const button = new KeysakoButton(options);
      expect(button).toBeInstanceOf(KeysakoButton);
      expect(IdentityProvider.initialize).toHaveBeenCalledWith(
        expect.objectContaining({
          clientId: 'test-client-id',
          usePopup: false,
        })
      );
    });

    it('should throw error if clientId is missing', () => {
      expect(() => {
        new KeysakoButton({} as KeysakoButtonOptions);
      }).toThrow('KeysakoButton: clientId is required');
    });

    it('should apply default options', () => {
      const options: KeysakoButtonOptions = {
        clientId: 'test-client-id',
      };

      new KeysakoButton(options);

      expect(IdentityProvider.initialize).toHaveBeenCalledWith(
        expect.objectContaining({
          clientId: 'test-client-id',
          usePopup: false,
        })
      );
    });

    it('should override default options with provided ones', () => {
      const options: KeysakoButtonOptions = {
        clientId: 'test-client-id',
        redirectUri: 'https://example.com/callback',
        age: 18,
        usePopup: true,
        theme: 'dark',
        shape: 'sharp',
      };

      new KeysakoButton(options);

      expect(IdentityProvider.initialize).toHaveBeenCalledWith(
        expect.objectContaining({
          clientId: 'test-client-id',
          redirectUri: 'https://example.com/callback',
          age: 18,
          usePopup: true,
        })
      );
    });
  });

  describe('createButtonElement', () => {
    let button: KeysakoButton;

    beforeEach(() => {
      button = new KeysakoButton({ clientId: 'test-client-id' });
    });

    it('should create a button element with default settings', async () => {
      const element = await button.createButtonElement();

      expect(element.tagName).toBe('BUTTON');
      expect(element.className).toBe('keysako-button');
      expect(element.querySelector('.keysako-button-logo')).toBeTruthy();
      expect(element.querySelector('.keysako-button-text')).toBeTruthy();
    });

    it('should create logo-only button', async () => {
      button = new KeysakoButton({
        clientId: 'test-client-id',
        logoOnly: true,
      });

      const element = await button.createButtonElement();

      expect(element.classList.contains('logo-only')).toBe(true);
      expect(element.querySelector('.keysako-button-logo')).toBeTruthy();
      expect(element.querySelector('.keysako-button-text')).toBeFalsy();
    });

    it('should add age badge when age is specified', async () => {
      button = new KeysakoButton({
        clientId: 'test-client-id',
        age: 18,
      });

      const element = await button.createButtonElement();

      const badge = element.querySelector('.keysako-button-age-badge');
      expect(badge).toBeTruthy();
      expect(badge?.textContent).toBe('18+');
    });

    it('should handle RTL languages', async () => {
      button = new KeysakoButton({
        clientId: 'test-client-id',
        locale: 'ar-SA',
      });

      const element = await button.createButtonElement();

      expect(element.getAttribute('dir')).toBe('rtl');
      expect(element.style.fontFamily).toContain('system-ui');
    });

    it('should show sign out text when authenticated', async () => {
      mockTokenManager.hasValidAccessToken.mockResolvedValue(true);

      const element = await button.createButtonElement();
      const textElement = element.querySelector('.keysako-button-text');

      expect(textElement?.textContent).toBe('Sign out');
    });

    it('should show sign in text when not authenticated', async () => {
      mockTokenManager.hasValidAccessToken.mockResolvedValue(false);

      const element = await button.createButtonElement();
      const textElement = element.querySelector('.keysako-button-text');

      expect(textElement?.textContent).toBe('Sign in with Keysako');
    });
  });

  describe('getStyles', () => {
    it('should return CSS styles string', () => {
      const button = new KeysakoButton({ clientId: 'test-client-id' });
      const styles = button.getStyles();

      expect(typeof styles).toBe('string');
      expect(styles).toContain('.keysako-button');
      expect(styles).toContain('--keysako-btn-bg');
    });

    it('should include theme-specific CSS variables', () => {
      const button = new KeysakoButton({
        clientId: 'test-client-id',
        theme: 'dark',
      });
      const styles = button.getStyles();

      expect(styles).toContain('--keysako-btn-bg');
      expect(styles).toContain('--keysako-btn-color');
    });
  });

  describe('authentication callbacks', () => {
    it('should call onSuccess when authentication succeeds', () => {
      const onSuccess = jest.fn();
      new KeysakoButton({
        clientId: 'test-client-id',
        onSuccess,
      });

      // Simulate successful auth
      const mockResult: AuthResult = {
        success: true,
        token: 'access-token',
        isAuthorized: true,
        hasIdentity: true,
        hasRequiredAge: true,
        isCountryAllowed: true,
      };

      // Get the callback passed to IdentityProvider
      const initCall = (IdentityProvider.initialize as jest.Mock).mock.calls[0][0];
      initCall.onAuthComplete(mockResult);

      expect(onSuccess).toHaveBeenCalledWith(mockResult);
    });

    it('should call onError when authentication fails', () => {
      const onError = jest.fn();
      new KeysakoButton({
        clientId: 'test-client-id',
        onError,
      });

      // Simulate failed auth
      const mockResult: AuthResult = {
        success: false,
        error: 'Authentication failed',
        isAuthorized: false,
        hasIdentity: false,
        hasRequiredAge: false,
        isCountryAllowed: false,
      };

      // Get the callback passed to IdentityProvider
      const initCall = (IdentityProvider.initialize as jest.Mock).mock.calls[0][0];
      initCall.onAuthComplete(mockResult);

      expect(onError).toHaveBeenCalledWith({ error: 'Authentication failed' });
    });
  });
});

describe('getButtonText', () => {
  it('should return English text by default', () => {
    const text = getButtonText('en-US');
    expect(text.signIn).toBe('Sign in with Keysako');
    expect(text.signOut).toBe('Sign out');
    expect(text.ageFormat).toBe('{age}+');
    expect(text.isRTL).toBe(false);
  });

  it('should return French text for French locale', () => {
    const text = getButtonText('fr-FR');
    expect(text.signIn).toBe('Se connecter avec Keysako');
    expect(text.signOut).toBe('Se déconnecter');
    expect(text.isRTL).toBe(false);
  });

  it('should return Spanish text for Spanish locale', () => {
    const text = getButtonText('es-ES');
    expect(text.signIn).toBe('Iniciar sesión con Keysako');
    expect(text.signOut).toBe('Cerrar sesión');
    expect(text.isRTL).toBe(false);
  });

  it('should return German text for German locale', () => {
    const text = getButtonText('de-DE');
    expect(text.signIn).toBe('Mit Keysako anmelden');
    expect(text.signOut).toBe('Abmelden');
    expect(text.isRTL).toBe(false);
  });

  it('should return Arabic text for Arabic locale with RTL', () => {
    const text = getButtonText('ar-SA');
    expect(text.signIn).toBe('تسجيل الدخول باستخدام Keysako');
    expect(text.signOut).toBe('تسجيل الخروج');
    expect(text.ageFormat).toBe('+{age}');
    expect(text.isRTL).toBe(true);
  });

  it('should fallback to English for unknown locales', () => {
    const text = getButtonText('unknown-locale');
    expect(text.signIn).toBe('Sign in with Keysako');
    expect(text.signOut).toBe('Sign out');
    expect(text.isRTL).toBe(false);
  });

  it('should extract language code from full locale', () => {
    const text = getButtonText('fr-CA');
    expect(text.signIn).toBe('Se connecter avec Keysako');
  });

  it('should support all new language translations', () => {
    const testCases = [
      { locale: 'it-IT', expectedSignIn: 'Accedi con Keysako', expectedSignOut: 'Esci' },
      { locale: 'pt-BR', expectedSignIn: 'Entrar com Keysako', expectedSignOut: 'Sair' },
      { locale: 'nl-NL', expectedSignIn: 'Inloggen met Keysako', expectedSignOut: 'Uitloggen' },
      { locale: 'pl-PL', expectedSignIn: 'Zaloguj się z Keysako', expectedSignOut: 'Wyloguj się' },
      { locale: 'ru-RU', expectedSignIn: 'Войти с Keysako', expectedSignOut: 'Выйти' },
      { locale: 'ja-JP', expectedSignIn: 'Keysakoでサインイン', expectedSignOut: 'サインアウト' },
      { locale: 'ko-KR', expectedSignIn: 'Keysako로 로그인', expectedSignOut: '로그아웃' },
      { locale: 'zh-CN', expectedSignIn: '使用 Keysako 登录', expectedSignOut: '登出' },
      { locale: 'hi-IN', expectedSignIn: 'Keysako से साइन इन करें', expectedSignOut: 'साइन आउट' },
      { locale: 'tr-TR', expectedSignIn: 'Keysako ile giriş yap', expectedSignOut: 'Çıkış yap' },
      { locale: 'th-TH', expectedSignIn: 'เข้าสู่ระบบด้วย Keysako', expectedSignOut: 'ออกจากระบบ' },
      { locale: 'vi-VN', expectedSignIn: 'Đăng nhập với Keysako', expectedSignOut: 'Đăng xuất' },
    ];

    testCases.forEach(({ locale, expectedSignIn, expectedSignOut }) => {
      const buttonText = getButtonText(locale);
      expect(buttonText.signIn).toBe(expectedSignIn);
      expect(buttonText.signOut).toBe(expectedSignOut);
      expect(buttonText.isRTL).toBe(false);
      expect(buttonText.ageFormat).toBe('{age}+');
    });
  });
});

describe('logoSvg', () => {
  it('should export a valid SVG string', () => {
    expect(logoSvg).toContain('<svg');
    expect(logoSvg).toContain('</svg>');
    expect(logoSvg).toContain('viewBox="0 0 24 24"');
  });
});
