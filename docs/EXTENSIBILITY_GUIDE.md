# 拡張性ガイド

このドキュメントでは、個人ポータルサイトを拡張する方法について説明します。

## 🏗️ アーキテクチャ概要

このサイトは拡張性を重視して設計されており、以下の原則に基づいています：

- **設定駆動**: コンテンツは設定ファイルで管理
- **コンポーネント指向**: 再利用可能なコンポーネント設計
- **型安全**: TypeScriptによる型安全な開発
- **プラグイン式**: 新機能を既存コードに影響を与えずに追加

## 🔧 新機能の追加方法

### 1. 新しいセクションの追加

#### ステップ1: 型定義の作成

```typescript
// src/types/blog.ts
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  tags: string[];
  thumbnail?: string;
}

export interface BlogConfig {
  posts: BlogPost[];
  categories: string[];
  featuredPostId?: string;
}
```

#### ステップ2: 設定ファイルの拡張

```json
// public/config.json に追加
{
  "blog": {
    "posts": [
      {
        "id": "post-1",
        "title": "初めてのブログ投稿",
        "excerpt": "このサイトについて",
        "content": "詳細なコンテンツ...",
        "publishedAt": "2024-01-01",
        "tags": ["開発", "React"]
      }
    ],
    "categories": ["開発", "日記", "技術"],
    "featuredPostId": "post-1"
  }
}
```

#### ステップ3: コンポーネントの作成

```typescript
// src/components/BlogSection.tsx
import { motion } from 'framer-motion';
import { BlogConfig } from '../types/blog';

interface BlogSectionProps {
  blogConfig: BlogConfig;
}

export default function BlogSection({ blogConfig }: BlogSectionProps) {
  return (
    <motion.section
      className="py-20 bg-gray-50"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">ブログ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogConfig.posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
```

#### ステップ4: App.tsxに統合

```typescript
// src/App.tsx に追加
import BlogSection from './components/BlogSection';

// App コンポーネント内で使用
<BlogSection blogConfig={config.blog} />
```

### 2. 新しいAPI統合の追加

#### ステップ1: APIクライアントの作成

```typescript
// src/utils/githubApi.ts
export class GitHubAPIClient {
  private baseUrl = 'https://api.github.com';

  constructor(private username: string) {}

  async getRepositories(): Promise<Repository[]> {
    const response = await fetch(
      `${this.baseUrl}/users/${this.username}/repos`
    );
    if (!response.ok) {
      throw new Error('GitHub API Error');
    }
    return response.json();
  }

  async getProfile(): Promise<GitHubProfile> {
    const response = await fetch(`${this.baseUrl}/users/${this.username}`);
    if (!response.ok) {
      throw new Error('GitHub API Error');
    }
    return response.json();
  }
}
```

#### ステップ2: カスタムフックの作成

```typescript
// src/hooks/useGitHub.ts
import { useQuery } from '@tanstack/react-query';
import { GitHubAPIClient } from '../utils/githubApi';

export function useGitHubRepositories(username: string) {
  const client = new GitHubAPIClient(username);

  return useQuery({
    queryKey: ['github-repos', username],
    queryFn: () => client.getRepositories(),
    staleTime: 5 * 60 * 1000, // 5分
    cacheTime: 10 * 60 * 1000, // 10分
  });
}
```

#### ステップ3: コンポーネントでの使用

```typescript
// src/components/GitHubSection.tsx
import { useGitHubRepositories } from '../hooks/useGitHub';

export default function GitHubSection({ username }: { username: string }) {
  const { data: repos, isLoading, error } = useGitHubRepositories(username);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <section className="py-20">
      <h2 className="text-4xl font-bold mb-8">GitHub リポジトリ</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {repos?.map(repo => (
          <RepositoryCard key={repo.id} repository={repo} />
        ))}
      </div>
    </section>
  );
}
```

### 3. 新しいソーシャルメディアプラットフォームの追加

#### ステップ1: アイコンの追加

```typescript
// src/components/SocialLink.tsx に追加
const iconMap = {
  twitter: Twitter,
  github: Github,
  linkedin: Linkedin,
  discord: MessageCircle,
  // 新しいプラットフォームを追加
  mastodon: AtSign,
  bluesky: Cloud,
  threads: MessageSquare,
};
```

#### ステップ2: 設定ファイルに追加

```json
{
  "socialLinks": [
    {
      "platform": "mastodon",
      "url": "https://mastodon.social/@your_username",
      "icon": "mastodon",
      "label": "Mastodon",
      "username": "@your_username@mastodon.social",
      "isActive": true,
      "order": 5
    }
  ]
}
```

## 🎨 テーマとスタイルの拡張

### 1. ダークモード対応

#### ステップ1: テーマコンテキストの作成

```typescript
// src/contexts/ThemeContext.tsx
import { createContext, useContext, useState } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div className={isDark ? 'dark' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

#### ステップ2: Tailwind設定の更新

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ダークモード用カラー
        dark: {
          bg: '#1a1a1a',
          surface: '#2d2d2d',
          text: '#ffffff',
        },
      },
    },
  },
};
```

### 2. カスタムアニメーションの追加

```typescript
// src/utils/customAnimations.ts
export const customVariants = {
  slideInLeft: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
};
```

## 🔌 プラグインシステム

### プラグイン式コンポーネントの作成

```typescript
// src/types/plugin.ts
export interface Plugin {
  id: string;
  name: string;
  version: string;
  component: React.ComponentType<any>;
  config?: Record<string, any>;
  dependencies?: string[];
}

// src/utils/pluginManager.ts
export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();

  register(plugin: Plugin) {
    this.plugins.set(plugin.id, plugin);
  }

  get(id: string): Plugin | undefined {
    return this.plugins.get(id);
  }

  getAll(): Plugin[] {
    return Array.from(this.plugins.values());
  }
}
```

## 📊 分析とモニタリングの追加

### Google Analytics統合

```typescript
// src/utils/analytics.ts
export class Analytics {
  private trackingId: string;

  constructor(trackingId: string) {
    this.trackingId = trackingId;
    this.initialize();
  }

  private initialize() {
    // Google Analytics初期化コード
  }

  trackPageView(path: string) {
    // ページビュー追跡
  }

  trackEvent(action: string, category: string, label?: string) {
    // イベント追跡
  }
}
```

### パフォーマンス監視の拡張

```typescript
// src/utils/performanceMonitor.ts の拡張
export class AdvancedPerformanceMonitor extends PerformanceMonitor {
  trackUserInteraction(element: string, action: string) {
    // ユーザーインタラクション追跡
  }

  trackAPIPerformance(endpoint: string, duration: number) {
    // API パフォーマンス追跡
  }

  generateReport(): PerformanceReport {
    // 詳細なパフォーマンスレポート生成
  }
}
```

## 🔧 実装済み機能の詳細

### エラーハンドリングシステム

プロジェクトには包括的なエラーハンドリングシステムが実装されています：

- **グローバルエラーハンドラー**: 予期しないエラーをキャッチし、ログ記録
- **エラーバウンダリ**: Reactコンポーネントエラーの適切な処理
- **API エラー処理**: YouTube API エラーの詳細な分類と対応
- **フォールバック機能**: API 障害時の代替表示

### パフォーマンス最適化

- **コード分割**: React.lazy による動的インポート
- **バンドル最適化**: 効率的なチャンク分割
- **画像最適化**: 遅延読み込みとWebP対応
- **キャッシュ戦略**: React Query による効率的なデータキャッシュ

### アクセシビリティ機能

- **キーボードナビゲーション**: 完全なキーボード操作対応
- **スクリーンリーダー対応**: ARIA属性とセマンティックHTML
- **カラーコントラスト**: WCAG AA準拠のコントラスト比
- **フォーカス管理**: 適切なフォーカス順序とインジケーター

## 🌐 多言語対応

### 国際化（i18n）の実装

#### ステップ1: 翻訳ファイルの作成

```json
// public/locales/ja.json
{
  "hero": {
    "greeting": "こんにちは！",
    "name": "{{name}}です",
    "cta": "もっと詳しく"
  },
  "about": {
    "title": "私について",
    "description": "詳細な自己紹介..."
  }
}

// public/locales/en.json
{
  "hero": {
    "greeting": "Hello!",
    "name": "I'm {{name}}",
    "cta": "Learn More"
  },
  "about": {
    "title": "About Me",
    "description": "Detailed self-introduction..."
  }
}
```

#### ステップ2: i18nフックの作成

```typescript
// src/hooks/useI18n.ts
import { useState, useEffect } from 'react';

interface Translations {
  [key: string]: any;
}

export function useI18n(defaultLanguage = 'ja') {
  const [language, setLanguage] = useState(defaultLanguage);
  const [translations, setTranslations] = useState<Translations>({});

  useEffect(() => {
    loadTranslations(language);
  }, [language]);

  const loadTranslations = async (lang: string) => {
    try {
      const response = await fetch(`/locales/${lang}.json`);
      const data = await response.json();
      setTranslations(data);
    } catch (error) {
      console.error('Translation loading failed:', error);
    }
  };

  const t = (key: string, params?: Record<string, string>) => {
    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
      value = value?.[k];
    }

    if (typeof value === 'string' && params) {
      return value.replace(
        /\{\{(\w+)\}\}/g,
        (match, key) => params[key] || match
      );
    }

    return value || key;
  };

  return { language, setLanguage, t };
}
```

## 🔄 状態管理の拡張

### Zustand を使用したグローバル状態管理

```typescript
// src/store/useStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  theme: 'light' | 'dark';
  language: string;
  preferences: UserPreferences;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: string) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
}

export const useStore = create<AppState>()(
  persist(
    set => ({
      theme: 'light',
      language: 'ja',
      preferences: {},
      setTheme: theme => set({ theme }),
      setLanguage: language => set({ language }),
      updatePreferences: preferences =>
        set(state => ({
          preferences: { ...state.preferences, ...preferences },
        })),
    }),
    {
      name: 'app-storage',
    }
  )
);
```

## 🎯 SEO とメタデータの拡張

### React Helmet を使用したメタデータ管理

```typescript
// src/components/SEOHead.tsx
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export default function SEOHead({
  title = 'Personal Portal Site',
  description = '個人ポータルサイト',
  image = '/images/og-image.png',
  url = 'https://your-domain.com',
  type = 'website'
}: SEOHeadProps) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
```

## 📱 PWA対応

### Service Worker の追加

```typescript
// public/sw.js
const CACHE_NAME = 'personal-portal-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/config.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
```

### Manifest.json の作成

```json
// public/manifest.json
{
  "name": "Personal Portal Site",
  "short_name": "Portal",
  "description": "個人ポータルサイト",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#00B33A",
  "background_color": "#FFFFFF",
  "icons": [
    {
      "src": "/images/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/images/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 🔐 認証システムの追加

### Firebase Authentication統合

```typescript
// src/utils/auth.ts
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  // Firebase設定
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export class AuthService {
  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  async signOut() {
    return auth.signOut();
  }

  getCurrentUser() {
    return auth.currentUser;
  }
}
```

### 認証フックの作成

```typescript
// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../utils/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
}
```

## 📊 CMS統合

### Headless CMS（Strapi）との統合

```typescript
// src/utils/cmsApi.ts
export class CMSClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getContent<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}/api/${endpoint}`);
    if (!response.ok) {
      throw new Error('CMS API Error');
    }
    return response.json();
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    return this.getContent('blog-posts');
  }

  async getProjects(): Promise<Project[]> {
    return this.getContent('projects');
  }
}
```

## 🧪 テストの拡張

### 新しいコンポーネントのテスト

```typescript
// src/test/BlogSection.test.tsx
import { render, screen } from '@testing-library/react';
import BlogSection from '../components/BlogSection';
import { mockBlogConfig } from './mocks';

describe('BlogSection', () => {
  it('should render blog posts correctly', () => {
    render(<BlogSection blogConfig={mockBlogConfig} />);

    expect(screen.getByText('ブログ')).toBeInTheDocument();
    expect(screen.getByText('初めてのブログ投稿')).toBeInTheDocument();
  });

  it('should handle empty blog posts', () => {
    const emptyConfig = { posts: [], categories: [] };
    render(<BlogSection blogConfig={emptyConfig} />);

    expect(screen.getByText('投稿がありません')).toBeInTheDocument();
  });
});
```

## 🚀 デプロイメントの拡張

### 複数環境対応

```javascript
// scripts/deploy-staging.cjs
const { execSync } = require('child_process');

const deployToStaging = () => {
  console.log('Staging環境にデプロイ中...');

  // ステージング用ビルド
  execSync('npm run build:staging', { stdio: 'inherit' });

  // ステージング用S3バケットにアップロード
  execSync('aws s3 sync dist/ s3://your-staging-bucket --delete', {
    stdio: 'inherit',
  });

  console.log('Staging環境へのデプロイが完了しました');
};

deployToStaging();
```

## 📈 監視とログの拡張

### エラー追跡（Sentry）統合

```typescript
// src/utils/errorTracking.ts
import * as Sentry from '@sentry/react';

export const initializeErrorTracking = () => {
  Sentry.init({
    dsn: process.env.VITE_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  });
};

export const trackError = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, { extra: context });
};
```

## 🔧 開発ツールの拡張

### カスタムESLintルール

```javascript
// .eslintrc.cjs に追加
module.exports = {
  rules: {
    // カスタムルール
    'custom/no-unused-translations': 'warn',
    'custom/consistent-component-naming': 'error',
  },
};
```

### カスタムPrettier設定

```json
// .prettierrc に追加
{
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

## 📚 ベストプラクティス

### 1. コンポーネント設計

- 単一責任の原則を守る
- プロップスの型定義を明確にする
- 再利用可能性を考慮する
- アクセシビリティを最初から考慮する

### 2. パフォーマンス

- React.memoを適切に使用
- 不要な再レンダリングを避ける
- 画像の最適化
- コード分割の活用

### 3. セキュリティ

- 環境変数でAPIキーを管理
- XSS対策の実装
- HTTPS の強制
- セキュリティヘッダーの設定

### 4. 保守性

- 一貫したコーディングスタイル
- 適切なコメントとドキュメント
- テストカバレッジの維持
- 定期的な依存関係の更新

## 🔮 将来の拡張予定

- [ ] ブログ機能
- [ ] プロジェクトポートフォリオ
- [ ] お問い合わせフォーム
- [ ] 管理者ダッシュボード
- [ ] リアルタイム通知
- [ ] 検索機能
- [ ] コメントシステム
- [ ] RSS フィード

## 📞 サポート

拡張に関する質問や問題がある場合：

1. **ドキュメント**を確認
2. **GitHub Issues**で問題を報告
3. **コミュニティ**で質問

## 📄 関連ドキュメント

- [設定ファイル使用ガイド](./CONFIG_USAGE.md)
- [デプロイメントガイド](./DEPLOYMENT.md)
- [API リファレンス](./API_REFERENCE.md)
- [コンポーネントガイド](./COMPONENTS.md)
