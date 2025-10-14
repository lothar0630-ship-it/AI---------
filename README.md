# Personal Portal Site

個人ポータルサイト - React、TypeScript、Tailwind CSSで構築されたモダンな個人ポートフォリオとソーシャルメディアハブ

## ✨ 概要

このプロジェクトは、個人の情報やソーシャルメディア活動を一元的に表示するモダンなポータルサイトです。YouTube Data API v3との統合により、最新の動画情報を自動取得し、レスポンシブデザインとアクセシビリティに配慮した設計となっています。

## 🚀 主要機能

- **モダンな技術スタック**: React 18 + TypeScript + Vite
- **スタイリング**: カスタムカラーパレット付きTailwind CSS
- **API統合**: 動的コンテンツのためのYouTube Data API v3
- **状態管理**: サーバー状態管理のためのReact Query
- **アニメーション**: 滑らかなインタラクションのためのFramer Motion
- **コード品質**: ESLint + Prettier設定
- **レスポンシブデザイン**: モバイルファーストアプローチ
- **アクセシビリティ**: WCAG準拠のアクセシビリティ機能
- **パフォーマンス**: 最適化されたバンドルサイズとローディング
- **AWS デプロイメント**: S3 + CloudFrontでの本番環境対応
- **エラーハンドリング**: 包括的なエラー処理とフォールバック機能
- **テスト**: 包括的なテストスイート（単体・統合・アクセシビリティテスト）

## 📁 プロジェクト構造

```
src/
├── components/          # Reactコンポーネント
│   ├── AboutSection.tsx     # 自己紹介セクション
│   ├── Header.tsx           # ヘッダーナビゲーション
│   ├── HeroSection.tsx      # ヒーローセクション
│   ├── YouTubeSection.tsx   # YouTubeチャンネル表示
│   ├── SocialSection.tsx    # ソーシャルメディアリンク
│   ├── Footer.tsx           # フッター
│   ├── ErrorBoundary.tsx    # エラーハンドリング
│   └── LazyComponents.tsx   # 遅延読み込みコンポーネント
├── hooks/               # カスタムReactフック
│   ├── useConfig.ts         # 設定ファイル読み込み
│   ├── useYouTubeVideos.ts  # YouTube API統合
│   └── useScrollAnimation.ts # スクロールアニメーション
├── types/               # TypeScript型定義
│   ├── index.ts             # 基本型定義
│   └── youtube.ts           # YouTube API型定義
├── utils/               # ユーティリティ関数
│   ├── youtubeApi.ts        # YouTube API クライアント
│   ├── errorHandler.ts      # エラーハンドリング
│   ├── performanceMonitor.ts # パフォーマンス監視
│   └── accessibilityHelpers.ts # アクセシビリティヘルパー
├── test/                # テストファイル
└── assets/              # 静的アセット（画像、アイコンなど）
```

## 🛠️ セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境設定

1. `.env.example`を`.env`にコピー
2. YouTube Data API キーを`VITE_YOUTUBE_API_KEY`に追加
3. 必要に応じて他の環境変数を設定

```bash
# .env ファイルの例
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
VITE_APP_TITLE=Personal Portal Site
VITE_APP_DESCRIPTION=個人ポータルサイト
```

### 3. 設定ファイルの編集

`public/config.json`を編集して個人情報を設定：

```json
{
  "personalInfo": {
    "name": "あなたの名前",
    "title": "職業・肩書き",
    "description": "自己紹介文",
    "avatar": "images/avatar.png"
  },
  "youtubeChannels": [
    {
      "id": "YOUR_CHANNEL_ID",
      "name": "チャンネル名",
      "description": "チャンネル説明",
      "url": "https://youtube.com/channel/YOUR_CHANNEL_ID"
    }
  ],
  "socialLinks": [
    {
      "platform": "twitter",
      "url": "https://twitter.com/your_username",
      "icon": "twitter",
      "label": "Twitter"
    }
  ]
}
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

### 5. 本番ビルド

```bash
npm run build
```

## 🎨 デザインシステム

### カラーパレット

- **プライマリ**: #00B33A (ディープグリーン)
- **セカンダリ**: #4B5563 (ニュートラルグレー)
- **アクセント**: #FF7700 (鮮やかオレンジ)
- **背景**: #FFFFFF (ホワイト)
- **テキスト**: #1F2937 (ダークグレー)

### タイポグラフィ

- **フォントファミリー**: Inter (Google Fonts)
- **レスポンシブスケーリング**: モバイルファーストアプローチ
- **見出し**: 800-900 font-weight
- **本文**: 400 font-weight

### アニメーション

- **ページ読み込み**: フェードインアニメーション
- **スクロール**: Intersection Observer API使用
- **ホバー効果**: 微細なスケールアップとシャドウ強化
- **トランジション**: 150-500ms の滑らかなアニメーション

## 📝 利用可能なスクリプト

### 開発用

- `npm run dev` - 開発サーバーの起動
- `npm run build` - 本番用ビルド
- `npm run preview` - 本番ビルドのプレビュー
- `npm run lint` - ESLintの実行
- `npm run format` - Prettierでのコード整形

### テスト用

- `npm run test` - テストの実行
- `npm run test:watch` - テストのウォッチモード
- `npm run test:coverage` - カバレッジ付きテスト
- `npm run test:performance` - パフォーマンステスト

### デプロイメント用

- `npm run deploy:build` - デプロイ用ビルド
- `npm run deploy:full` - フルデプロイメント
- `npm run deploy:verify` - デプロイメント検証
- `npm run deploy:status` - デプロイメント状況確認

### AWS関連

- `npm run aws:setup` - AWS設定
- `npm run aws:status` - AWS状況確認

### 環境設定

- `npm run env:setup` - 環境設定
- `npm run env:dev` - 開発環境設定
- `npm run env:prod` - 本番環境設定

## 🔧 設定ファイル

### 主要設定ファイル

- `vite.config.ts` - Vite設定（最適化含む）
- `tsconfig.json` - TypeScript設定（パスマッピング含む）
- `tailwind.config.js` - Tailwind CSSカスタムテーマ
- `.eslintrc.cjs` - ESLintルールと設定
- `.prettierrc` - コード整形ルール
- `vitest.config.ts` - テスト設定

### 環境設定ファイル

- `.env` - 環境変数（ローカル開発用）
- `.env.example` - 環境変数のテンプレート
- `.env.production` - 本番環境用設定
- `public/config.json` - アプリケーション設定

## 🚀 デプロイメント

### AWS S3 + CloudFront デプロイメント

1. **AWS設定**

```bash
npm run aws:setup
```

2. **ビルドとデプロイ**

```bash
npm run deploy:full
```

3. **デプロイメント確認**

```bash
npm run deploy:verify
```

### 手動デプロイメント

1. **ビルド**

```bash
npm run build
```

2. **distフォルダをS3にアップロード**
3. **CloudFrontキャッシュの無効化**

## 🧪 テスト

### テスト構成

- **単体テスト**: Jest + React Testing Library
- **統合テスト**: YouTube API連携テスト
- **アクセシビリティテスト**: WCAG準拠チェック
- **パフォーマンステスト**: バンドルサイズとローディング速度
- **エンドツーエンドテスト**: ユーザーフロー全体

### テスト実行

```bash
# 全テスト実行
npm run test

# カバレッジ付きテスト
npm run test:coverage

# パフォーマンステスト
npm run test:performance
```

## 📋 要件対応状況

### 機能要件

- ✅ 1.1-1.3: 自己紹介セクションの表示
- ✅ 2.1-2.3: YouTubeチャンネル情報の表示
- ✅ 3.1-3.3: 最新動画の自動取得と表示
- ✅ 4.1-4.3: Twitterアカウントリンク
- ✅ 5.1-5.3: 拡張可能な構造

### 技術要件

- ✅ 6.1-6.4: レスポンシブデザインとパフォーマンス
- ✅ 7.1-7.4: AWS S3 + CloudFrontデプロイメント
- ✅ 8.1-8.4: TypeScript開発環境とコード品質

## 🔧 カスタマイズ

### 新しいセクションの追加

1. `src/components/`に新しいコンポーネントを作成
2. `src/App.tsx`にコンポーネントを追加
3. 必要に応じて`public/config.json`に設定を追加

### 新しいソーシャルメディアの追加

1. `public/config.json`の`socialLinks`配列に新しいリンクを追加
2. 必要に応じてアイコンを追加

### スタイルのカスタマイズ

1. `tailwind.config.js`でカラーパレットを変更
2. `src/index.css`でグローバルスタイルを調整

## 🐛 トラブルシューティング

### よくある問題

1. **YouTube API エラー**
   - API キーが正しく設定されているか確認
   - API クォータ制限に達していないか確認

2. **ビルドエラー**
   - `npm install`で依存関係を再インストール
   - TypeScript エラーを確認

3. **デプロイメントエラー**
   - AWS 認証情報が正しく設定されているか確認
   - S3 バケット権限を確認

### ログとデバッグ

- ブラウザの開発者ツールでコンソールエラーを確認
- `npm run test`でテストエラーを確認
- `npm run deploy:status`でデプロイメント状況を確認

## 🤝 貢献方法

1. リポジトリをフォークして新しいブランチを作成
2. 変更を実装
3. テストを実行して全て通過することを確認
4. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはプライベートプロジェクトです。すべての権利を保有します。
