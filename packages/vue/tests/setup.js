const { config } = require('@vue/test-utils');

// Vue 3 doesn't need global.Vue
// global.Vue = require('vue');

// Mock window.addEventListener and removeEventListener
Object.defineProperty(window, 'addEventListener', {
  value: jest.fn(),
  writable: true,
});

Object.defineProperty(window, 'removeEventListener', {
  value: jest.fn(),
  writable: true,
});

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Configure Vue Test Utils
config.global.mocks = {
  $t: msg => msg,
};
