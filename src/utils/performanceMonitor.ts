/**
 * パフォーマンス監視ユーティリティ
 * Web Vitals とカスタムメトリクスを測定
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url?: string;
}

export interface WebVitalsMetric extends PerformanceMetric {
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private isEnabled: boolean;

  constructor(enabled = true) {
    this.isEnabled = enabled && typeof window !== 'undefined';

    if (this.isEnabled) {
      this.initializeObservers();
      this.measureInitialLoad();
    }
  }

  /**
   * パフォーマンスオブザーバーを初期化
   */
  private initializeObservers(): void {
    try {
      // Largest Contentful Paint (LCP)
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;

          if (lastEntry) {
            this.recordMetric({
              name: 'LCP',
              value: lastEntry.startTime,
              timestamp: Date.now(),
              url: window.location.href,
            });
          }
        });

        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.recordMetric({
              name: 'FID',
              value: entry.processingStart - entry.startTime,
              timestamp: Date.now(),
              url: window.location.href,
            });
          });
        });

        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });

          this.recordMetric({
            name: 'CLS',
            value: clsValue,
            timestamp: Date.now(),
            url: window.location.href,
          });
        });

        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      }
    } catch (error) {
      console.warn('Failed to initialize performance observers:', error);
    }
  }

  /**
   * 初期読み込み時のメトリクスを測定
   */
  private measureInitialLoad(): void {
    if (typeof window === 'undefined') return;

    // DOM Content Loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.recordMetric({
          name: 'DCL',
          value: performance.now(),
          timestamp: Date.now(),
          url: window.location.href,
        });
      });
    }

    // Window Load
    if (document.readyState !== 'complete') {
      window.addEventListener('load', () => {
        this.recordMetric({
          name: 'Load',
          value: performance.now(),
          timestamp: Date.now(),
          url: window.location.href,
        });

        // Navigation Timing API
        this.measureNavigationTiming();
      });
    } else {
      this.measureNavigationTiming();
    }
  }

  /**
   * Navigation Timing API を使用してメトリクスを測定
   */
  private measureNavigationTiming(): void {
    try {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      if (navigation) {
        // Time to First Byte (TTFB)
        const ttfb = navigation.responseStart - navigation.requestStart;
        this.recordMetric({
          name: 'TTFB',
          value: ttfb,
          timestamp: Date.now(),
          url: window.location.href,
        });

        // DNS Lookup Time
        const dnsTime =
          navigation.domainLookupEnd - navigation.domainLookupStart;
        this.recordMetric({
          name: 'DNS',
          value: dnsTime,
          timestamp: Date.now(),
          url: window.location.href,
        });

        // TCP Connection Time
        const tcpTime = navigation.connectEnd - navigation.connectStart;
        this.recordMetric({
          name: 'TCP',
          value: tcpTime,
          timestamp: Date.now(),
          url: window.location.href,
        });
      }
    } catch (error) {
      console.warn('Failed to measure navigation timing:', error);
    }
  }

  /**
   * カスタムメトリクスを記録
   */
  recordMetric(metric: PerformanceMetric): void {
    if (!this.isEnabled) return;

    this.metrics.push(metric);

    // 開発環境でのログ出力
    if (import.meta.env.DEV) {
      console.log(
        `Performance Metric - ${metric.name}:`,
        metric.value.toFixed(2),
        'ms'
      );
    }

    // メトリクス数の制限（メモリリーク防止）
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-50);
    }
  }

  /**
   * 時間測定を開始
   */
  startTiming(name: string): () => void {
    if (!this.isEnabled) return () => {};

    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      this.recordMetric({
        name,
        value: endTime - startTime,
        timestamp: Date.now(),
        url: window.location.href,
      });
    };
  }

  /**
   * リソース読み込み時間を測定
   */
  measureResourceTiming(): void {
    if (!this.isEnabled) return;

    try {
      const resources = performance.getEntriesByType(
        'resource'
      ) as PerformanceResourceTiming[];

      resources.forEach(resource => {
        const loadTime = resource.responseEnd - resource.startTime;

        // 大きなリソースのみ記録
        if (loadTime > 100) {
          this.recordMetric({
            name: `Resource: ${resource.name.split('/').pop() || 'unknown'}`,
            value: loadTime,
            timestamp: Date.now(),
            url: resource.name,
          });
        }
      });
    } catch (error) {
      console.warn('Failed to measure resource timing:', error);
    }
  }

  /**
   * メモリ使用量を測定（Chrome のみ）
   */
  measureMemoryUsage(): void {
    if (!this.isEnabled) return;

    try {
      const memory = (performance as any).memory;
      if (memory) {
        this.recordMetric({
          name: 'Memory Used',
          value: memory.usedJSHeapSize / 1024 / 1024, // MB
          timestamp: Date.now(),
          url: window.location.href,
        });

        this.recordMetric({
          name: 'Memory Total',
          value: memory.totalJSHeapSize / 1024 / 1024, // MB
          timestamp: Date.now(),
          url: window.location.href,
        });
      }
    } catch (error) {
      console.warn('Failed to measure memory usage:', error);
    }
  }

  /**
   * 全メトリクスを取得
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * 特定のメトリクスを取得
   */
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === name);
  }

  /**
   * メトリクスの統計情報を取得
   */
  getMetricStats(name: string): {
    count: number;
    average: number;
    min: number;
    max: number;
  } | null {
    const metrics = this.getMetricsByName(name);

    if (metrics.length === 0) return null;

    const values = metrics.map(m => m.value);

    return {
      count: metrics.length,
      average: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }

  /**
   * パフォーマンスレポートを生成
   */
  generateReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: this.metrics,
      stats: {
        LCP: this.getMetricStats('LCP'),
        FID: this.getMetricStats('FID'),
        CLS: this.getMetricStats('CLS'),
        TTFB: this.getMetricStats('TTFB'),
        Load: this.getMetricStats('Load'),
      },
    };

    return JSON.stringify(report, null, 2);
  }

  /**
   * クリーンアップ
   */
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }
}

// デフォルトのパフォーマンスモニターインスタンス
export const performanceMonitor = new PerformanceMonitor(
  import.meta.env.DEV ||
    import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true'
);

// Web Vitals の閾値
export const WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 },
};

export default PerformanceMonitor;
