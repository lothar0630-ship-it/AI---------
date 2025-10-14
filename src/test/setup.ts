import '@testing-library/jest-dom';

// テスト用環境変数の設定
if (!import.meta.env.VITE_YOUTUBE_API_KEY) {
  Object.defineProperty(import.meta.env, 'VITE_YOUTUBE_API_KEY', {
    value: 'test-api-key-for-testing',
    writable: true,
  });
}

if (!import.meta.env.VITE_APP_TITLE) {
  Object.defineProperty(import.meta.env, 'VITE_APP_TITLE', {
    value: 'Personal Portal Site',
    writable: true,
  });
}

if (!import.meta.env.VITE_APP_DESCRIPTION) {
  Object.defineProperty(import.meta.env, 'VITE_APP_DESCRIPTION', {
    value: 'Modern personal portfolio and social media hub',
    writable: true,
  });
}

// グローバルなテスト設定
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// IntersectionObserver のモック
global.IntersectionObserver = class IntersectionObserver {
  root: Element | null = null;
  rootMargin: string = '0px';
  thresholds: ReadonlyArray<number> = [0];

  constructor(
    _callback: IntersectionObserverCallback,
    _options?: IntersectionObserverInit
  ) {}

  observe(_target: Element): void {}
  unobserve(_target: Element): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
};

// matchMedia のモック
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
