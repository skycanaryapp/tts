import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

// Mock environment variables
vi.mock('../config/environment', () => ({
  config: {
    appName: 'Mandaleen Test',
    appVersion: '1.0.0',
    apiBaseUrl: 'http://localhost:3000/api',
    zokaWebhookUrl: 'http://localhost:3000/webhook/zoka',
    geminiApiKey: 'test-key',
    environment: 'development',
    debug: true,
    logLevel: 'debug',
  },
  isDevelopment: true,
  isProduction: false,
  validateConfig: vi.fn(),
}));

// Mock speech APIs
Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: {
    speak: vi.fn(),
    cancel: vi.fn(),
    getVoices: vi.fn(() => []),
  },
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: vi.fn(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    abort: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    continuous: false,
    interimResults: false,
    lang: 'ar-SA',
    onresult: null,
    onerror: null,
    onend: null,
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Clean up after each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});