import { generateChallenge, generateCodeVerifier, getQueryParam, getVerifier, parseJwt, randomCode } from "./utils";

export class KeysakoClient {
    private issuerUrl = 'https://auth.keysako.com';

    public async auth(clientId: string, redirectUri: string, restrictToAge: number = 18) {
        const verifier = await generateCodeVerifier();
        const challenge = await generateChallenge(verifier);
        if (typeof window !== "undefined") {
            sessionStorage.setItem("verifier", JSON.stringify({ verifier }));
        }

        const params = new URLSearchParams();
        params.append("client_id", clientId);
        params.append("redirect_uri", redirectUri);
        params.append("response_type", "code");
        params.append("scope", `openid profile user.required_age:${restrictToAge}`);
        params.append("code_challenge", challenge);
        params.append("code_challenge_method", "S256");
        params.append("state", randomCode());
        const url = new URL(`https://auth.keysako.com/connect/authorize?${params.toString()}`);

        window.open(url.toString());
    }

    public async complete(clientId: string, redirectUri: string, restrictToAge: number = 18): Promise<boolean> {
        var url = `${this.issuerUrl}/connect/token`;

        const codeVerifier = getVerifier().verifier;
        const code = getQueryParam('code');

        const u = new URLSearchParams();
        u.append('grant_type', 'authorization_code');
        u.append('redirect_uri', redirectUri);
        u.append('code', code ?? '');
        u.append('client_id', clientId ?? '');
        u.append('code_verifier', codeVerifier);

        return fetch(url, {
            method: 'POST',
            body: u,
        }).then(response => {
            return response.json();
        }).then(data => {
            var token = data.access_token;
            var decoded = parseJwt(token);

            if (decoded[`has_more_than_${restrictToAge}`].toLowerCase() === "true") {
                return true;
            } else {
                return false;
            }
        }).catch(_ => {
            return false;
        });
    }
}
