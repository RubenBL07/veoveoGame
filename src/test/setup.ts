import '@testing-library/jest-dom';

// Mock de localStorage con manejo de JSON
let mockStorage: Record<string, string> = {
  'veoveo_theme': 'default',
  'veoveo_custom_themes': '[]',
};

const localStorageMock = {
  getItem: vi.fn((key: string) => {
    return mockStorage[key] || null;
  }),
  setItem: vi.fn((key: string, value: string) => {
    mockStorage[key] = value;
    console.log(`localStorage.setItem(${key}, ${value})`);
  }),
  removeItem: vi.fn((key: string) => {
    delete mockStorage[key];
  }),
  clear: vi.fn(() => {
    mockStorage = {};
  }),
  length: Object.keys(mockStorage).length,
  key: vi.fn((index: number) => {
    const keys = Object.keys(mockStorage);
    return keys[index] || null;
  }),
};
global.localStorage = localStorageMock;

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock de IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock de ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock de navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});
