import { TokenManager } from './token-manager.js';

export interface AuthResult {
    success: boolean;
    hasRequiredAge?: boolean;
    error?: string;
}

export interface IdentityConfig {
    clientId: string;
    redirectUri?: string;
    age?: number;
    usePopup?: boolean;
    onAuthComplete?: (result: AuthResult) => void;
}

export class IdentityProvider {
    private static readonly AUTHORIZATION_ENDPOINT = 'https://localhost:5001/connect/authorize';
    private static readonly TOKEN_ENDPOINT = 'https://localhost:5001/connect/token';
    private static readonly END_SESSION_ENDPOINT = 'https://localhost:5001/connect/endsession';
    private static readonly BASE_SCOPE = 'openid profile';
    private static readonly RESPONSE_TYPE = 'code';
    private static readonly POPUP_WIDTH = 500;
    private static readonly POPUP_HEIGHT = 600;

    private config: IdentityConfig;
    private static instance: IdentityProvider;
    private tokenManager: TokenManager;
    private popupWindow: Window | null = null;
    private popupMessageListener: ((event: MessageEvent) => void) | null = null;

    private constructor(config: IdentityConfig) {
        this.config = {
            redirectUri: window.location.origin,
            usePopup: false,
            ...config
        };
        this.tokenManager = TokenManager.getInstance();
        this.handleCallbackIfPresent();
    }

    static initialize(config: IdentityConfig): IdentityProvider {
        if (!IdentityProvider.instance) {
            IdentityProvider.instance = new IdentityProvider(config);
        }
        return IdentityProvider.instance;
    }

    static getInstance(): IdentityProvider {
        if (!IdentityProvider.instance) {
            throw new Error('IdentityProvider must be initialized with a config first');
        }
        return IdentityProvider.instance;
    }

    private getScope(): string {
        const scopes = [IdentityProvider.BASE_SCOPE];
        if (this.config.age !== undefined) {
            scopes.push(`user.required_age:${this.config.age}`);
        }
        return scopes.join(' ');
    }

    private handleCallbackIfPresent(): void {
        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.has('code')) {
            this.handleCallback(queryParams);
        }
    }

    private async generateCodeChallenge(): Promise<{ codeVerifier: string; codeChallenge: string }> {
        const array = new Uint32Array(32);
        window.crypto.getRandomValues(array);
        const codeVerifier = Array.from(array, dec => ('0' + dec.toString(16)).slice(-2)).join('');

        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);
        const digest = await window.crypto.subtle.digest('SHA-256', data);

        const base64Digest = btoa(String.fromCharCode(...new Uint8Array(digest)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');

        return { codeVerifier, codeChallenge: base64Digest };
    }

    private isMobileDevice(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    async login(): Promise<void> {
        const { codeVerifier, codeChallenge } = await this.generateCodeChallenge();
        const state = this.generateRandomString();
        const nonce = this.generateRandomString();

        sessionStorage.setItem('auth_state', state);
        sessionStorage.setItem('auth_nonce', nonce);
        sessionStorage.setItem('code_verifier', codeVerifier);

        const redirectUri = this.config.redirectUri || window.location.origin;
        
        const params = new URLSearchParams({
            client_id: this.config.clientId,
            redirect_uri: redirectUri,
            response_type: IdentityProvider.RESPONSE_TYPE,
            scope: this.getScope(),
            state: state,
            nonce: nonce,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256'
        });

        const authUrl = `${IdentityProvider.AUTHORIZATION_ENDPOINT}?${params.toString()}`;

        // Sur mobile, on force toujours le mode redirection
        if (this.config.usePopup && !this.isMobileDevice()) {
            this.popupWindow = this.openPopupWindow(authUrl);
            if (!this.popupWindow) {
                // Fallback en mode redirection si la popup est bloquée
                window.location.href = authUrl;
                return;
            }

            try {
                const { code, state: returnedState } = await this.setupPopupMessageListener();
                await this.handleCallback(new URLSearchParams({ code, state: returnedState }));
            } catch (error) {
                console.error('Popup authentication failed:', error);
                // En cas d'erreur, on bascule en mode redirection
                window.location.href = authUrl;
            }
        } else {
            window.location.href = authUrl;
        }
    }

    private generateRandomString(): string {
        const array = new Uint32Array(28);
        window.crypto.getRandomValues(array);
        return Array.from(array, dec => ('0' + dec.toString(16)).slice(-2)).join('');
    }

    private async handleCallback(queryParams: URLSearchParams): Promise<void> {
        const state = queryParams.get('state');
        const code = queryParams.get('code');
        const storedState = sessionStorage.getItem('auth_state');
        const codeVerifier = sessionStorage.getItem('code_verifier');

        if (!code) {
            const error = 'No authorization code received';
            if (this.config.onAuthComplete) {
                this.config.onAuthComplete({ success: false, error });
            }
            throw new Error(error);
        }

        if (state !== storedState) {
            const error = 'Invalid state parameter';
            if (this.config.onAuthComplete) {
                this.config.onAuthComplete({ success: false, error });
            }
            throw new Error(error);
        }

        try {
            const tokenResponse = await this.tokenManager.getTokensFromCode(code, codeVerifier!, this.config.redirectUri);
            
            // Vérifie l'âge si requis
            let hasRequiredAge = undefined;
            if (this.config.age !== undefined) {
                hasRequiredAge = this.tokenManager.hasRequiredAge(this.config.age);
            }

            if (this.config.onAuthComplete) {
                this.config.onAuthComplete({ 
                    success: true,
                    hasRequiredAge
                });
            }

            // Nettoyer le stockage
            sessionStorage.removeItem('auth_state');
            sessionStorage.removeItem('auth_nonce');
            sessionStorage.removeItem('code_verifier');
        } catch (error: any) {
            if (this.config.onAuthComplete) {
                this.config.onAuthComplete({ 
                    success: false, 
                    error: error.message 
                });
            }
            throw error;
        }
    }

    private setupPopupMessageListener(): Promise<{ code: string, state: string }> {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                if (this.popupWindow) {
                    this.popupWindow.close();
                }
                reject(new Error('Popup authentication timed out'));
            }, 300000); // 5 minutes timeout

            this.popupMessageListener = (event: MessageEvent) => {
                if (event.origin !== window.location.origin) {
                    return;
                }

                const data = event.data;
                if (data.type === 'authorization_response') {
                    clearTimeout(timeout);
                    if (this.popupMessageListener) {
                        window.removeEventListener('message', this.popupMessageListener);
                        this.popupMessageListener = null;
                    }
                    if (this.popupWindow) {
                        this.popupWindow.close();
                        this.popupWindow = null;
                    }
                    resolve(data);
                }
            };

            window.addEventListener('message', this.popupMessageListener);
        });
    }

    private openPopupWindow(url: string): Window | null {
        const width = IdentityProvider.POPUP_WIDTH;
        const height = IdentityProvider.POPUP_HEIGHT;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2.5;

        return window.open(
            url,
            'oauth-popup',
            `width=${width},height=${height},left=${left},top=${top},location=yes,toolbar=no,menubar=no`
        );
    }

    isAuthenticated(): boolean {
        return this.tokenManager.hasValidAccessToken();
    }

    getAccessToken(): string | null {
        return this.tokenManager.getAccessToken();
    }

    getIdToken(): string | null {
        return this.tokenManager.getIdToken();
    }

    async logout(): Promise<void> {
        const tokens = this.tokenManager.getTokens();
        const idToken = tokens?.id_token;
        
        // Nettoyer les tokens locaux
        this.tokenManager.clearTokens();

        if (!idToken) {
            // Si pas de token, on redirige simplement vers la page d'accueil
            window.location.href = window.location.origin;
            return;
        }

        const postLogoutRedirectUri = this.config.redirectUri || window.location.origin;
        
        const params = new URLSearchParams({
            id_token_hint: idToken,
            post_logout_redirect_uri: postLogoutRedirectUri,
            client_id: this.config.clientId
        });

        if (this.config.usePopup && !this.isMobileDevice()) {
            this.popupWindow = this.openPopupWindow(`${IdentityProvider.END_SESSION_ENDPOINT}?${params.toString()}`);
            if (!this.popupWindow) {
                // Fallback en mode redirection si la popup est bloquée
                window.location.href = `${IdentityProvider.END_SESSION_ENDPOINT}?${params.toString()}`;
                return;
            }

            try {
                // Attendre que la popup se ferme
                await new Promise<void>((resolve) => {
                    const checkClosed = setInterval(() => {
                        if (this.popupWindow?.closed) {
                            clearInterval(checkClosed);
                            this.popupWindow = null;
                            resolve();
                        }
                    }, 500);

                    // Timeout après 30 secondes
                    setTimeout(() => {
                        clearInterval(checkClosed);
                        if (this.popupWindow) {
                            this.popupWindow.close();
                            this.popupWindow = null;
                        }
                        resolve();
                    }, 30000);
                });

                // Rediriger vers la page d'accueil après la fermeture de la popup
                if (window.location.href !== postLogoutRedirectUri) {
                    window.location.href = postLogoutRedirectUri;
                }
            } catch (error) {
                console.error('Logout popup error:', error);
                // En cas d'erreur, on force la redirection
                window.location.href = `${IdentityProvider.END_SESSION_ENDPOINT}?${params.toString()}`;
            }
        } else {
            // Mode redirection classique
            window.location.href = `${IdentityProvider.END_SESSION_ENDPOINT}?${params.toString()}`;
        }
    }
}
