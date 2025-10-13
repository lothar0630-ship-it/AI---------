/**
 * リソースプリローディングユーティリティ
 * 重要なリソースを事前に読み込んでパフォーマンスを向上
 */

interface PreloadOptions {
  as?: 'image' | 'script' | 'style' | 'font' | 'fetch';
  crossorigin?: 'anonymous' | 'use-credentials';
  type?: string;
  priority?: 'high' | 'low' | 'auto';
}

class ResourcePreloader {
  private preloadedResources = new Set<string>();
  private preloadPromises = new Map<string, Promise<void>>();

  /**
   * リソースをプリロード
   */
  preload(href: string, options: PreloadOptions = {}): Promise<void> {
    // 既にプリロード済みの場合は既存のPromiseを返す
    if (this.preloadPromises.has(href)) {
      return this.preloadPromises.get(href)!;
    }

    const promise = this.createPreloadPromise(href, options);
    this.preloadPromises.set(href, promise);

    return promise;
  }

  /**
   * プリロードPromiseを作成
   */
  private createPreloadPromise(
    href: string,
    options: PreloadOptions
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // 既にプリロード済みの場合
      if (this.preloadedResources.has(href)) {
        resolve();
        return;
      }

      // link要素を作成
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;

      if (options.as) link.as = options.as;
      if (options.crossorigin) link.crossOrigin = options.crossorigin;
      if (options.type) link.type = options.type;

      // 読み込み完了/エラーハンドラー
      const cleanup = () => {
        link.removeEventListener('load', onLoad);
        link.removeEventListener('error', onError);
      };

      const onLoad = () => {
        cleanup();
        this.preloadedResources.add(href);
        resolve();
      };

      const onError = () => {
        cleanup();
        console.warn(`Failed to preload resource: ${href}`);
        reject(new Error(`Failed to preload: ${href}`));
      };

      link.addEventListener('load', onLoad);
      link.addEventListener('error', onError);

      // DOMに追加
      document.head.appendChild(link);
    });
  }

  /**
   * 画像をプリロード
   */
  preloadImage(src: string): Promise<void> {
    if (this.preloadPromises.has(src)) {
      return this.preloadPromises.get(src)!;
    }

    const promise = new Promise<void>((resolve, reject) => {
      if (this.preloadedResources.has(src)) {
        resolve();
        return;
      }

      const img = new Image();

      const cleanup = () => {
        img.removeEventListener('load', onLoad);
        img.removeEventListener('error', onError);
      };

      const onLoad = () => {
        cleanup();
        this.preloadedResources.add(src);
        resolve();
      };

      const onError = () => {
        cleanup();
        console.warn(`Failed to preload image: ${src}`);
        reject(new Error(`Failed to preload image: ${src}`));
      };

      img.addEventListener('load', onLoad);
      img.addEventListener('error', onError);
      img.src = src;
    });

    this.preloadPromises.set(src, promise);
    return promise;
  }

  /**
   * フォントをプリロード
   */
  preloadFont(href: string, type = 'font/woff2'): Promise<void> {
    return this.preload(href, {
      as: 'font',
      type,
      crossorigin: 'anonymous',
    });
  }

  /**
   * CSSをプリロード
   */
  preloadCSS(href: string): Promise<void> {
    return this.preload(href, { as: 'style' });
  }

  /**
   * JavaScriptをプリロード
   */
  preloadScript(href: string): Promise<void> {
    return this.preload(href, { as: 'script' });
  }

  /**
   * 複数のリソースを並行してプリロード
   */
  preloadMultiple(
    resources: Array<{ href: string; options?: PreloadOptions }>
  ): Promise<void[]> {
    const promises = resources.map(({ href, options }) =>
      this.preload(href, options).catch(error => {
        console.warn(`Failed to preload ${href}:`, error);
        return Promise.resolve(); // エラーを無視して続行
      })
    );

    return Promise.all(promises);
  }

  /**
   * 重要な画像を事前読み込み
   */
  preloadCriticalImages(images: string[]): Promise<void[]> {
    const promises = images.map(src =>
      this.preloadImage(src).catch(error => {
        console.warn(`Failed to preload critical image ${src}:`, error);
        return Promise.resolve();
      })
    );

    return Promise.all(promises);
  }

  /**
   * プリロード状態をチェック
   */
  isPreloaded(href: string): boolean {
    return this.preloadedResources.has(href);
  }

  /**
   * プリロード統計を取得
   */
  getStats(): {
    totalPreloaded: number;
    pendingPreloads: number;
    preloadedResources: string[];
  } {
    return {
      totalPreloaded: this.preloadedResources.size,
      pendingPreloads: this.preloadPromises.size - this.preloadedResources.size,
      preloadedResources: Array.from(this.preloadedResources),
    };
  }

  /**
   * キャッシュをクリア
   */
  clear(): void {
    this.preloadedResources.clear();
    this.preloadPromises.clear();
  }
}

// デフォルトのプリローダーインスタンス
export const resourcePreloader = new ResourcePreloader();

/**
 * 重要なリソースを事前読み込み
 */
export const preloadCriticalResources = async (): Promise<void> => {
  try {
    // 重要な画像のプリロード
    const criticalImages = [
      '/images/avatar.jpg',
      '/images/avatar-placeholder.svg',
      '/images/video-placeholder.svg',
    ];

    // Google Fonts のプリロード
    const fonts = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
    ];

    await Promise.allSettled([
      resourcePreloader.preloadCriticalImages(criticalImages),
      ...fonts.map(font => resourcePreloader.preloadCSS(font)),
    ]);

    console.log('Critical resources preloaded successfully');
  } catch (error) {
    console.warn('Failed to preload some critical resources:', error);
  }
};

export default ResourcePreloader;
