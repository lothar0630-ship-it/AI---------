import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';
import { globalErrorHandler } from './utils/errorHandler';
import { performanceMonitor } from './utils/performanceMonitor';
import { defaultCache } from './utils/cacheManager';
import { preloadCriticalResources } from './utils/resourcePreloader';

// Initialize global error handler
globalErrorHandler.updateConfig({
  enableLogging: import.meta.env.DEV,
  enableReporting: import.meta.env.PROD,
  maxErrors: 100,
});

// 重要なリソースのプリロード
preloadCriticalResources();

// Create a client for React Query with optimized caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // YouTube API エラーの場合はリトライしない
        if (error?.status === 403 || error?.status === 400) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      // ネットワーク状態に応じた設定
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
});

// パフォーマンス測定開始
const renderStart = performanceMonitor.startTiming('React Render');

// 定期的なキャッシュクリーンアップ
setInterval(
  () => {
    defaultCache.cleanup();
  },
  5 * 60 * 1000
); // 5分ごと

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

// レンダリング完了時間を記録
renderStart();

// ページ離脱時のクリーンアップ
window.addEventListener('beforeunload', () => {
  performanceMonitor.cleanup();
});
