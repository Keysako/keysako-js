/**
 * Parse a JWT token and return its claims
 * @param token JWT token to parse
 * @returns Parsed token claims
 */
export function parseJwt(token: string): any {
  try {
    // Get the payload part of the JWT (second part)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Decode the base64 string
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
}

/**
 * Generate a random string for state and nonce values
 * @returns Random string
 */
export function generateRandomString(): string {
  const array = new Uint32Array(28);
  window.crypto.getRandomValues(array);
  return Array.from(array, dec => ('0' + dec.toString(16)).slice(-2)).join('');
}

/**
 * Check if the current device is a mobile device
 * @returns True if the device is mobile
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Get contrast color (black or white) based on background color
 * @param backgroundColor Background color in hex format
 * @returns Contrasting color (black or white)
 */
export function getContrastColor(backgroundColor: string): string {
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
