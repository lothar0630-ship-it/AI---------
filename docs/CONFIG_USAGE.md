# 設定ファイルとデータ管理システム

このドキュメントでは、個人ポータルサイトの設定ファイルシステムの使用方法について説明します。

## 概要

設定システムは以下の機能を提供します：

- JSON設定ファイルからのデータ読み込み
- TypeScript型安全性
- デフォルト値とフォールバック処理
- 設定データの検証
- React カスタムフックによる簡単なアクセス

## 設定ファイル構造

### 基本構造

```json
{
  "personalInfo": {
    "name": "開発者名",
    "title": "職業・肩書き",
    "description": "自己紹介文",
    "avatar": "/images/avatar.jpg"
  },
  "youtubeChannels": [
    {
      "id": "UCxxxxxxxxxxxxx",
      "name": "チャンネル名",
      "description": "チャンネル説明",
      "url": "https://youtube.com/channel/UCxxxxxxxxxxxxx",
      "customUrl": "@channelname"
    }
  ],
  "socialLinks": [
    {
      "platform": "twitter",
      "url": "https://twitter.com/username",
      "icon": "twitter",
      "label": "Twitter"
    }
  ],
  "theme": {
    "primaryColor": "#00B33A",
    "secondaryColor": "#4B5563",
    "accentColor": "#FF7700"
  }
}
```

### 設定ファイルの場所

設定ファイルは `public/config.json` に配置してください。この場所に配置することで、ビルド後も動的に設定を変更できます。

## カスタムフックの使用方法

### 1. 全体設定の取得

```tsx
import { useConfig } from '../hooks';

function App() {
  const { config, loading, error } = useConfig();

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;

  return <div>{config.personalInfo.name}</div>;
}
```

### 2. 個別設定項目の取得（推奨）

パフォーマンスを向上させるため、必要な設定項目のみを取得することを推奨します：

```tsx
import {
  usePersonalInfo,
  useYouTubeChannels,
  useSocialLinks,
  useTheme,
} from '../hooks';

function HeroSection() {
  const { personalInfo, loading, error } = usePersonalInfo();

  if (loading) return <div>読み込み中...</div>;

  return (
    <div>
      <h1>{personalInfo.name}</h1>
      <p>{personalInfo.title}</p>
    </div>
  );
}

function YouTubeSection() {
  const { channels, loading, error } = useYouTubeChannels();

  return (
    <div>
      {channels.map(channel => (
        <div key={channel.id}>{channel.name}</div>
      ))}
    </div>
  );
}
```

### 3. テーマの適用

```tsx
import { useTheme } from '../hooks';

function ThemedComponent() {
  const { theme } = useTheme();

  return (
    <div style={{ color: theme.primaryColor }}>
      テーマカラーが適用されたテキスト
    </div>
  );
}
```

## 利用可能なフック

| フック名               | 戻り値                             | 説明                            |
| ---------------------- | ---------------------------------- | ------------------------------- |
| `useConfig()`          | `{ config, loading, error }`       | 全体の設定を取得                |
| `usePersonalInfo()`    | `{ personalInfo, loading, error }` | 個人情報のみを取得              |
| `useYouTubeChannels()` | `{ channels, loading, error }`     | YouTubeチャンネル情報のみを取得 |
| `useSocialLinks()`     | `{ socialLinks, loading, error }`  | ソーシャルリンク情報のみを取得  |
| `useTheme()`           | `{ theme, loading, error }`        | テーマ設定のみを取得            |
| `useConfigReload()`    | `{ reload, reloadTrigger }`        | 設定の再読み込み機能            |

## エラーハンドリング

### 自動フォールバック

設定ファイルの読み込みに失敗した場合、自動的にデフォルト設定が使用されます：

```tsx
function App() {
  const { config, loading, error } = useConfig();

  // エラーが発生してもデフォルト設定で動作継続
  // error は null になり、config にはデフォルト値が設定される

  return <div>{config.personalInfo.name}</div>; // "デフォルト開発者"
}
```

### エラー表示

エラーを表示したい場合は、明示的にチェックできます：

```tsx
function App() {
  const { config, loading, error } = useConfig();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        fallbackMessage="デフォルト設定で動作しています"
      />
    );
  }

  return <MainContent config={config} />;
}
```

## 設定の検証

### 自動検証

設定ファイルは読み込み時に自動的に検証され、不正な値は除外またはデフォルト値で置換されます：

```typescript
// 不正なYouTubeチャンネルIDは自動的に除外
// 不正なURLは自動的に除外
// 不正なカラーコードはデフォルト値で置換
```

### 手動検証

ユーティリティ関数を使用して手動で検証することも可能です：

```tsx
import { validateConfigSchema, validateConfigValue } from '../utils';

// 設定全体の検証
const { isValid, errors } = validateConfigSchema(configData);

// 個別値の検証
const isValidUrl = validateConfigValue.isValidUrl('https://example.com');
const isValidColor = validateConfigValue.isValidHexColor('#FF0000');
```

## ベストプラクティス

### 1. 個別フックの使用

パフォーマンスのため、必要な設定項目のみを取得する個別フックを使用してください：

```tsx
// ❌ 避けるべき（全体設定を取得）
const { config } = useConfig();
const name = config.personalInfo.name;

// ✅ 推奨（必要な部分のみ取得）
const { personalInfo } = usePersonalInfo();
const name = personalInfo.name;
```

### 2. ローディング状態の処理

ユーザー体験のため、適切なローディング表示を実装してください：

```tsx
function Component() {
  const { personalInfo, loading } = usePersonalInfo();

  if (loading) {
    return <Skeleton />; // スケルトンローダー
  }

  return <Content data={personalInfo} />;
}
```

### 3. エラー境界の使用

予期しないエラーをキャッチするため、エラー境界を設定してください：

```tsx
function App() {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <ConfigProvider>
        <MainApp />
      </ConfigProvider>
    </ErrorBoundary>
  );
}
```

## 設定ファイルの更新

### 開発環境

開発環境では、設定ファイルを変更後にページをリロードしてください。

### 本番環境

本番環境では、`public/config.json` を更新するだけで設定が反映されます（アプリケーションの再デプロイは不要）。

## トラブルシューティング

### よくある問題

1. **設定が読み込まれない**
   - `public/config.json` が存在するか確認
   - JSON形式が正しいか確認
   - ブラウザの開発者ツールでネットワークエラーを確認

2. **TypeScriptエラー**
   - 型定義が最新か確認
   - 必要なプロパティが設定ファイルに含まれているか確認

3. **デフォルト設定が使用される**
   - 設定ファイルの形式を確認
   - 必須フィールドが含まれているか確認

### デバッグ方法

```tsx
import { useConfig } from '../hooks';

function DebugComponent() {
  const { config, loading, error } = useConfig();

  console.log('Config state:', { config, loading, error });

  return <pre>{JSON.stringify({ config, loading, error }, null, 2)}</pre>;
}
```

## 型定義

設定に関する型定義は `src/types/index.ts` で確認できます：

- `SiteConfig` - サイト全体の設定
- `PersonalInfo` - 個人情報
- `YouTubeChannel` - YouTubeチャンネル情報
- `SocialLink` - ソーシャルメディアリンク
- `ThemeConfig` - テーマ設定
