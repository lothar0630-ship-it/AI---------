# 設定ファイル使用ガイド

このドキュメントでは、個人ポータルサイトの設定ファイルの使用方法について詳しく説明します。

## 📁 設定ファイルの場所

### メイン設定ファイル

- `public/config.json` - アプリケーションのメイン設定
- `.env` - 環境変数（API キーなど）
- `.env.example` - 環境変数のテンプレート
- `.env.production` - 本番環境用設定

### その他の設定ファイル

- `vite.config.ts` - Vite ビルド設定
- `tailwind.config.js` - スタイル設定
- `tsconfig.json` - TypeScript 設定

## 🔧 config.json の詳細設定

### 基本構造

```json
{
  "personalInfo": { ... },
  "youtubeChannels": [ ... ],
  "socialLinks": [ ... ],
  "theme": { ... }
}
```

### personalInfo セクション

個人情報を設定します。

```json
{
  "personalInfo": {
    "name": "あなたの名前",
    "title": "職業・肩書き",
    "description": "自己紹介文（簡潔に）",
    "avatar": "images/avatar.png",
    "detailedDescription": "詳細な自己紹介文（AboutSectionで使用）",
    "skills": ["JavaScript", "TypeScript", "React", "Node.js"],
    "experience": "経歴情報",
    "location": "所在地（オプション）",
    "email": "contact@example.com（オプション）"
  }
}
```

#### フィールド説明

- `name`: サイトに表示される名前
- `title`: 職業や肩書き
- `description`: ヒーローセクションで表示される簡潔な自己紹介
- `avatar`: アバター画像のパス（publicフォルダからの相対パス）
- `detailedDescription`: 自己紹介セクションで表示される詳細な説明
- `skills`: スキルタグとして表示される技術スタック
- `experience`: 経歴情報
- `location`: 所在地（オプション）
- `email`: 連絡先メールアドレス（オプション）

### youtubeChannels セクション

YouTubeチャンネル情報を設定します。

```json
{
  "youtubeChannels": [
    {
      "id": "UCxxxxxxxxxxxxx",
      "name": "メインチャンネル",
      "description": "ゲーム実況やプログラミング関連の動画を投稿",
      "url": "https://youtube.com/channel/UCxxxxxxxxxxxxx",
      "customUrl": "@your-channel-name",
      "category": "gaming",
      "language": "ja",
      "isActive": true
    },
    {
      "id": "UCyyyyyyyyyyy",
      "name": "サブチャンネル",
      "description": "日常のVlogや趣味の動画",
      "url": "https://youtube.com/channel/UCyyyyyyyyyyy",
      "customUrl": "@your-sub-channel",
      "category": "lifestyle",
      "language": "ja",
      "isActive": true
    }
  ]
}
```

#### フィールド説明

- `id`: YouTubeチャンネルID（必須）
- `name`: チャンネル名
- `description`: チャンネルの説明
- `url`: チャンネルのURL
- `customUrl`: カスタムURL（@から始まる）
- `category`: チャンネルのカテゴリ（オプション）
- `language`: 言語設定（オプション）
- `isActive`: アクティブかどうか（オプション）

### socialLinks セクション

ソーシャルメディアリンクを設定します。

```json
{
  "socialLinks": [
    {
      "platform": "twitter",
      "url": "https://twitter.com/your_username",
      "icon": "twitter",
      "label": "Twitter",
      "username": "@your_username",
      "isActive": true,
      "order": 1
    },
    {
      "platform": "github",
      "url": "https://github.com/your_username",
      "icon": "github",
      "label": "GitHub",
      "username": "your_username",
      "isActive": true,
      "order": 2
    },
    {
      "platform": "linkedin",
      "url": "https://linkedin.com/in/your_username",
      "icon": "linkedin",
      "label": "LinkedIn",
      "username": "your_username",
      "isActive": true,
      "order": 3
    },
    {
      "platform": "discord",
      "url": "https://discord.gg/your_server",
      "icon": "discord",
      "label": "Discord",
      "username": "your_username#1234",
      "isActive": false,
      "order": 4
    }
  ]
}
```

#### サポートされているプラットフォーム

- `twitter` - Twitter/X
- `github` - GitHub
- `linkedin` - LinkedIn
- `discord` - Discord
- `instagram` - Instagram
- `youtube` - YouTube（個別チャンネルリンク用）
- `twitch` - Twitch
- `tiktok` - TikTok
- `facebook` - Facebook

#### フィールド説明

- `platform`: プラットフォーム名（上記リストから選択）
- `url`: プロフィールのURL
- `icon`: アイコン名（Lucide Reactアイコン名）
- `label`: 表示ラベル
- `username`: ユーザー名（オプション）
- `isActive`: 表示するかどうか
- `order`: 表示順序（数値が小さいほど先に表示）

### theme セクション

サイトのテーマカラーを設定します。

```json
{
  "theme": {
    "primaryColor": "#00B33A",
    "secondaryColor": "#4B5563",
    "accentColor": "#FF7700",
    "backgroundColor": "#FFFFFF",
    "textColor": "#1F2937",
    "borderColor": "#E5E7EB",
    "darkMode": false,
    "fontFamily": "Inter"
  }
}
```

#### フィールド説明

- `primaryColor`: プライマリカラー（メインの色）
- `secondaryColor`: セカンダリカラー（サブの色）
- `accentColor`: アクセントカラー（強調色）
- `backgroundColor`: 背景色
- `textColor`: テキスト色
- `borderColor`: 境界線の色
- `darkMode`: ダークモード対応（将来の機能）
- `fontFamily`: フォントファミリー

## 🔑 環境変数設定

### .env ファイル

```bash
# YouTube Data API
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here

# アプリケーション設定
VITE_APP_TITLE=Personal Portal Site
VITE_APP_DESCRIPTION=個人ポータルサイト
VITE_APP_URL=https://your-domain.com

# 開発設定
VITE_DEV_MODE=true
VITE_DEBUG_MODE=false

# アナリティクス（オプション）
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# その他のAPI（オプション）
VITE_CONTACT_FORM_ENDPOINT=https://api.example.com/contact
```

### 環境変数の説明

#### 必須の環境変数

- `VITE_YOUTUBE_API_KEY`: YouTube Data API v3のAPIキー

#### オプションの環境変数

- `VITE_APP_TITLE`: アプリケーションのタイトル
- `VITE_APP_DESCRIPTION`: アプリケーションの説明
- `VITE_APP_URL`: アプリケーションのURL
- `VITE_DEV_MODE`: 開発モードの有効/無効
- `VITE_DEBUG_MODE`: デバッグモードの有効/無効
- `VITE_GA_TRACKING_ID`: Google Analytics トラッキングID
- `VITE_CONTACT_FORM_ENDPOINT`: お問い合わせフォームのエンドポイント

## 🎨 スタイル設定

### Tailwind CSS カスタマイズ

`tailwind.config.js`でカスタムカラーやスタイルを設定できます。

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          500: '#00B33A',
          600: '#009930',
          900: '#14532d',
        },
        secondary: {
          50: '#f9fafb',
          500: '#4B5563',
          600: '#374151',
          900: '#111827',
        },
        accent: {
          50: '#fff7ed',
          500: '#FF7700',
          600: '#ea580c',
          900: '#9a3412',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
    },
  },
};
```

## 📱 レスポンシブ設定

### ブレークポイント

Tailwind CSSのデフォルトブレークポイントを使用：

- `sm`: 640px以上
- `md`: 768px以上
- `lg`: 1024px以上
- `xl`: 1280px以上
- `2xl`: 1536px以上

### レスポンシブクラスの例

```html
<!-- モバイル: 1カラム、デスクトップ: 2カラム -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
  <!-- モバイル: 小さいテキスト、デスクトップ: 大きいテキスト -->
  <h1 class="text-2xl md:text-4xl lg:text-6xl">
    <!-- モバイル: 縦積み、デスクトップ: 横並び -->
    <div class="flex flex-col md:flex-row"></div>
  </h1>
</div>
```

## 🔧 高度な設定

### カスタムコンポーネントの追加

1. **新しいセクションの追加**

```typescript
// src/components/CustomSection.tsx
import { motion } from 'framer-motion';

interface CustomSectionProps {
  title: string;
  content: string;
}

export default function CustomSection({ title, content }: CustomSectionProps) {
  return (
    <motion.section
      className="py-20 bg-white"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">{title}</h2>
        <p className="text-lg">{content}</p>
      </div>
    </motion.section>
  );
}
```

2. **App.tsxに追加**

```typescript
import CustomSection from './components/CustomSection';

// App コンポーネント内で使用
<CustomSection
  title="カスタムセクション"
  content="ここにカスタムコンテンツを表示"
/>
```

### API統合の拡張

新しいAPIを統合する場合：

1. **型定義の追加** (`src/types/`)
2. **APIクライアントの作成** (`src/utils/`)
3. **カスタムフックの作成** (`src/hooks/`)
4. **コンポーネントでの使用**

## 🚀 デプロイメント設定

### AWS設定

`scripts/aws-deploy-config.json`でAWS設定をカスタマイズ：

```json
{
  "region": "ap-northeast-1",
  "s3Bucket": "your-site-bucket",
  "cloudFrontDistributionId": "EXXXXXXXXXXXXX",
  "profile": "default",
  "cacheControl": "max-age=31536000",
  "indexDocument": "index.html",
  "errorDocument": "index.html"
}
```

### 本番環境用設定

`.env.production`で本番環境固有の設定：

```bash
VITE_YOUTUBE_API_KEY=production_api_key
VITE_APP_URL=https://your-production-domain.com
VITE_GA_TRACKING_ID=G-PRODUCTION-ID
VITE_DEBUG_MODE=false
```

## 🔍 トラブルシューティング

### よくある設定エラー

1. **YouTube API キーエラー**
   - `.env`ファイルが正しく設定されているか確認
   - APIキーにYouTube Data API v3の権限があるか確認

2. **設定ファイル読み込みエラー**
   - `public/config.json`の JSON 構文が正しいか確認
   - 必須フィールドが不足していないか確認

3. **スタイル適用エラー**
   - Tailwind CSS のクラス名が正しいか確認
   - カスタムカラーが`tailwind.config.js`で定義されているか確認

### デバッグ方法

1. **ブラウザの開発者ツール**でコンソールエラーを確認
2. **Network タブ**で API リクエストの状況を確認
3. **React Developer Tools**でコンポーネントの状態を確認

## 📚 参考資料

- [YouTube Data API v3 ドキュメント](https://developers.google.com/youtube/v3)
- [Tailwind CSS ドキュメント](https://tailwindcss.com/docs)
- [Framer Motion ドキュメント](https://www.framer.com/motion/)
- [React Query ドキュメント](https://tanstack.com/query/latest)
