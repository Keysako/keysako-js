export async function generateCodeVerifier(): Promise<string> {
  const rando = randomCode();
  const encoded = base64URLEncode(rando);
  return encoded;
}

export function randomCode(): string {
  let array = new Uint8Array(32);
  array = globalThis.crypto.getRandomValues(array);
  return String.fromCharCode.apply(null, Array.from(array));
}

function base64URLEncode(str: string): string {
  const b64 = base64(str);
  const encoded = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  return encoded;
}

const sha256 = async (str: string): Promise<string> => {
  const digestOp = await getCryptoSubtle().digest(
    { name: "SHA-256" },
    new TextEncoder().encode(str)
  );
  return bufferToBase64UrlEncoded(digestOp);
};

const bufferToBase64UrlEncoded = (hash: ArrayBuffer): string => {
  const uintArray = new Uint8Array(hash);
  const numberArray = Array.from(uintArray);
  const hashString = String.fromCharCode(...numberArray);
  return urlEncodeB64(base64(hashString));
};

const urlEncodeB64 = (input: string) => {
  const b64Chars: { [index: string]: string } = { "+": "-", "/": "_", "=": "" };
  return input.replace(/[+/=]/g, (m: string) => b64Chars[m]);
};

export async function generateChallenge(
  codeVerifierString: string
): Promise<string> {
  const sha = await sha256(codeVerifierString);
  return sha;
}

export function getCryptoSubtle(): SubtleCrypto {
  return getCrypto().subtle;
}

export function base64(data: string): string {
  return btoa(data);
}

export function getCrypto(): Crypto {
  return globalThis.crypto;
}

export function getVerifier(): { verifier: string } {
  if (typeof window !== "undefined") {
    return JSON.parse(sessionStorage.getItem('verifier') || '{"verifier": ""}');
  }

  return { verifier: '' };
}

export function parseJwt(token: string) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

export function getQueryParam(param: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
}
