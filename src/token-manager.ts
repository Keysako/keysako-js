import { parseJwt } from './utils.js';

export interface TokenResponse {
    access_token: string;
    id_token: string;
    token_type: string;
    expires_in: number;
}

export interface TokenClaims {
    [key: string]: any;
}

export class TokenManager {
    private static readonly TOKEN_KEY = 'keysako_tokens';
    private static instance: TokenManager;

    private constructor() {}

    static getInstance(): TokenManager {
        if (!TokenManager.instance) {
            TokenManager.instance = new TokenManager();
        }
        return TokenManager.instance;
    }

    saveTokens(tokens: TokenResponse): void {
        const expiresAt = Date.now() + tokens.expires_in * 1000;
        const tokenData = {
            ...tokens,
            expires_at: expiresAt
        };
        localStorage.setItem(TokenManager.TOKEN_KEY, JSON.stringify(tokenData));

        // Dispatch un événement pour notifier que les tokens ont été mis à jour
        window.dispatchEvent(new CustomEvent('keysako:tokens_updated', {
            detail: {
                ...tokenData,
                claims: this.getTokenClaims()
            }
        }));
    }

    getTokens(): (TokenResponse & { expires_at: number }) | null {
        const tokenData = localStorage.getItem(TokenManager.TOKEN_KEY);
        if (!tokenData) return null;

        const tokens = JSON.parse(tokenData);
        if (Date.now() >= tokens.expires_at) {
            this.clearTokens();
            return null;
        }

        return tokens;
    }

    getTokenClaims(): TokenClaims | null {
        const tokens = this.getTokens();
        if (!tokens?.id_token) return null;
        
        try {
            return parseJwt(tokens.id_token);
        } catch (error) {
            console.error('Error parsing token claims:', error);
            return null;
        }
    }

    hasRequiredAge(requiredAge: number): boolean {
        const claims = this.getTokenClaims();
        if (!claims) return false;
        
        const claimName = `has_more_than_${requiredAge}`;
        return claims[claimName] === true;
    }

    clearTokens(): void {
        localStorage.removeItem(TokenManager.TOKEN_KEY);
        window.dispatchEvent(new CustomEvent('keysako:tokens_cleared'));
    }

    isAuthenticated(): boolean {
        const tokens = this.getTokens();
        return tokens !== null;
    }

    getAccessToken(): string | null {
        const tokens = this.getTokens();
        return tokens ? tokens.access_token : null;
    }

    getIdToken(): string | null {
        const tokens = this.getTokens();
        return tokens ? tokens.id_token : null;
    }

    async getTokensFromCode(code: string, codeVerifier: string, redirectUri?: string): Promise<TokenResponse> {
        const response = await fetch('https://localhost:5001/connect/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri || window.location.origin,
                client_id: 'keysako-test',
                code_verifier: codeVerifier
            })
        });

        if (!response.ok) {
            throw new Error('Failed to exchange code for token');
        }

        const tokens: TokenResponse = await response.json();
        this.saveTokens(tokens);
        return tokens;
    }

    hasValidAccessToken(): boolean {
        const tokens = this.getTokens();
        return tokens !== null && Date.now() < tokens.expires_at;
    }
}
