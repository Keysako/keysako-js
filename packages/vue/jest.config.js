module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'ts', 'vue'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }],
    '^.+\\.vue$': '@vue/vue3-jest',
  },
  testMatch: ['**/tests/**/*.test.(js|ts)'],
  collectCoverageFrom: ['src/**/*.{ts}', '!src/**/*.d.ts', '!src/index.ts', '!src/vue-shims.d.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  extensionsToTreatAsEsm: ['.ts'],
};
