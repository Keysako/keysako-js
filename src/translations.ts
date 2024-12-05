/**
 * Interface for button text translations
 */
interface ButtonText {
    /** Text for sign in button state */
    signIn: string;
    /** Text for sign out button state */
    signOut: string;
    /** Format string for age badge. Use {age} as placeholder for the actual age value */
    ageFormat: string;
    /** Whether the language is written right-to-left */
    isRTL?: boolean;
}

/**
 * Interface for all supported translations
 */
interface Translations {
    [key: string]: ButtonText;
}

/**
 * Translations for button text and age format
 * 
 * Supported languages:
 * - en: English
 * - fr: French (Français)
 * - es: Spanish (Español)
 * - de: German (Deutsch)
 * - it: Italian (Italiano)
 * - pt: Portuguese (Português)
 * - zh: Chinese (中文)
 * - ja: Japanese (日本語)
 * - ko: Korean (한국어)
 * - ar: Arabic (العربية) - RTL
 * - he: Hebrew (עברית) - RTL
 * - hi: Hindi (हिन्दी)
 * - ru: Russian (Русский)
 * - tr: Turkish (Türkçe)
 * - th: Thai (ไทย)
 * - vi: Vietnamese (Tiếng Việt)
 */
const translations: Translations = {
    'en': {
        signIn: 'Sign in',
        signOut: 'Sign out',
        ageFormat: '{age}+'
    },
    'fr': {
        signIn: 'Se connecter',
        signOut: 'Déconnexion',
        ageFormat: '{age} ans+'
    },
    'es': {
        signIn: 'Iniciar sesión',
        signOut: 'Cerrar sesión',
        ageFormat: '+{age} años'
    },
    'de': {
        signIn: 'Anmelden',
        signOut: 'Abmelden',
        ageFormat: 'ab {age}'
    },
    'it': {
        signIn: 'Accedi',
        signOut: 'Esci',
        ageFormat: '{age}+'
    },
    'pt': {
        signIn: 'Entrar',
        signOut: 'Sair',
        ageFormat: '{age}+'
    },
    'zh': {
        signIn: '登录',
        signOut: '退出',
        ageFormat: '{age}岁+'
    },
    'ja': {
        signIn: 'ログイン',
        signOut: 'ログアウト',
        ageFormat: '{age}歳以上'
    },
    'ko': {
        signIn: '로그인',
        signOut: '로그아웃',
        ageFormat: '{age}세+'
    },
    'ar': {
        signIn: 'تسجيل الدخول',
        signOut: 'تسجيل الخروج',
        ageFormat: '+{age}',
        isRTL: true
    },
    'he': {
        signIn: 'התחברות',
        signOut: 'התנתקות',
        ageFormat: '{age}+',
        isRTL: true
    },
    'hi': {
        signIn: 'साइन इन करें',
        signOut: 'साइन आउट',
        ageFormat: '{age}+'
    },
    'ru': {
        signIn: 'Войти',
        signOut: 'Выйти',
        ageFormat: '{age}+'
    },
    'tr': {
        signIn: 'Giriş yap',
        signOut: 'Çıkış yap',
        ageFormat: '{age}+'
    },
    'th': {
        signIn: 'เข้าสู่ระบบ',
        signOut: 'ออกจากระบบ',
        ageFormat: '{age}+'
    },
    'vi': {
        signIn: 'Đăng nhập',
        signOut: 'Đăng xuất',
        ageFormat: '{age}+'
    }
};

/**
 * Get button text translations for the specified language
 * 
 * @param lang - Language code (e.g., 'en', 'fr', 'es')
 * @returns ButtonText object containing translations for the specified language
 * @example
 * ```typescript
 * // Get French translations
 * const frText = getButtonText('fr');
 * console.log(frText.signIn); // "Se connecter"
 * 
 * // Format age with translations
 * const age = "18";
 * console.log(frText.ageFormat.replace('{age}', age)); // "18 ans+"
 * ```
 * @internal
 */
export function getButtonText(lang: string = 'en'): ButtonText {
    // Try to match the language code with region (e.g., 'fr-FR' -> 'fr')
    const baseLang = lang.split('-')[0].toLowerCase();
    return translations[baseLang] || translations['en'];
}
