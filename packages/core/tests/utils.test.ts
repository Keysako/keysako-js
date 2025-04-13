import { parseJwt, generateRandomString, isMobileDevice } from '../src/utils';

describe('Utils', () => {
  describe('parseJwt', () => {
    it('should parse a valid JWT token', () => {
      // This is a mock JWT token (header.payload.signature)
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      const result = parseJwt(token);
      
      expect(result).toEqual({
        sub: '1234567890',
        name: 'John Doe',
        iat: 1516239022
      });
    });
    
    it('should return null for an invalid token', () => {
      const invalidToken = 'invalid.token';
      
      const result = parseJwt(invalidToken);
      
      expect(result).toBeNull();
    });
    
    it('should return null for an empty token', () => {
      const result = parseJwt('');
      
      expect(result).toBeNull();
    });
  });
  
  describe('generateRandomString', () => {
    it('should generate a string of the expected format', () => {
      // Mock the crypto.getRandomValues function
      const mockGetRandomValues = jest.spyOn(window.crypto, 'getRandomValues');
      mockGetRandomValues.mockImplementation(array => {
        // Fill the array with predictable values
        const typedArray = array as Uint32Array;
        for (let i = 0; i < typedArray.length; i++) {
          typedArray[i] = i + 1;
        }
        return array;
      });
      
      const result = generateRandomString();
      
      // For 28 length Uint32Array, we'll get a 56 character hex string
      expect(result.length).toBe(56);
      expect(result).toMatch(/^[0-9a-f]+$/); // hex characters only
      
      // Restore the original implementation
      mockGetRandomValues.mockRestore();
    });
    
    it('should generate different strings on consecutive calls', () => {
      const result1 = generateRandomString();
      const result2 = generateRandomString();
      
      expect(result1).not.toBe(result2);
    });
  });
  
  describe('isMobileDevice', () => {
    const originalNavigator = global.navigator;
    
    afterEach(() => {
      // Restore the original navigator after each test
      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true
      });
    });
    
    it('should return true for mobile user agents', () => {
      // Mock mobile user agent
      Object.defineProperty(global, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
        },
        writable: true
      });
      
      expect(isMobileDevice()).toBe(true);
    });
    
    it('should return false for desktop user agents', () => {
      // Mock desktop user agent
      Object.defineProperty(global, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        writable: true
      });
      
      expect(isMobileDevice()).toBe(false);
    });
  });
});
