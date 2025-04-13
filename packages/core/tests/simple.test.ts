import { parseJwt } from '../src/utils';

describe('Simple tests', () => {
  test('parseJwt should return null for empty string', () => {
    expect(parseJwt('')).toBeNull();
  });
});
