import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Mock NEAR API JS
jest.mock('near-api-js', () => ({
  connect: jest.fn(),
  keyStores: {
    BrowserLocalStorageKeyStore: jest.fn(),
  },
  Account: jest.fn(),
  Near: jest.fn(),
}));

// Mock NEAR Wallet Selector
jest.mock('@near-wallet-selector/core', () => ({
  setupWalletSelector: jest.fn(),
}));

// Mock crypto APIs for testing
Object.assign(global, {
  crypto: {
    getRandomValues: (arr: any) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  },
});

// Mock TextEncoder/TextDecoder
Object.assign(global, { TextEncoder, TextDecoder });

// Mock console methods in tests
global.console = {
  ...console,
  // Suppress console.log during tests unless explicitly testing it
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
