# YouTube API 動作確認ガイド

## 1. YouTube Data API キーの取得

### Google Cloud Console での設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成または既存プロジェクトを選択
3. 「APIとサービス」→「ライブラリ」から「YouTube Data API v3」を検索
4. 「有効にする」をクリック
5. 「認証情報」→「認証情報を作成」→「APIキー」を選択
6. 作成されたAPIキーをコピー

### APIキーの制限設定（推奨）

- 「APIキーを制限」をクリック
- 「APIの制限」で「YouTube Data API v3」のみを選択
- 「HTTPリファラー」で開発環境のドメインを設定

## 2. 環境変数の設定

`.env` ファイルを編集：

```env
# YouTube Data API Configuration
VITE_YOUTUBE_API_KEY=AIzaSyC-your-actual-api-key-here

# Application Configuration
VITE_APP_TITLE=Personal Portal Site
VITE_APP_DESCRIPTION=Modern personal portfolio and social media hub

# Development Configuration
VITE_DEV_MODE=true
```

## 3. チャンネル ID の確認方法

### 方法1: チャンネルURLから

- チャンネルページのURL: `https://www.youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw`
- `UC` で始まる24文字の部分がチャンネルID

### 方法2: カスタムURLの場合

- `https://www.youtube.com/@username` の場合
- チャンネルページの「概要」タブでチャンネルIDを確認

## 4. config.json の更新

`public/config.json` の `youtubeChannels` セクションを実際のチャンネル情報に更新：

```json
{
  "youtubeChannels": [
    {
      "id": "UC_x5XG1OV2P6uZZ5FSM9Ttw",
      "name": "Google Developers",
      "description": "Google の開発者向けコンテンツ",
      "url": "https://youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw",
      "customUrl": "@googledevelopers"
    }
  ]
}
```

## 5. 動作確認コマンド

```bash
# 開発サーバーを起動
npm run dev

# ブラウザで http://localhost:5173 にアクセス
```

## 6. 確認ポイント

✅ YouTube API キーが正しく設定されている
✅ チャンネル ID が実在するチャンネルのもの
✅ API制限に引っかかっていない（1日10,000リクエスト）
✅ ネットワーク接続が正常

## 7. トラブルシューティング

### API キーエラー

- コンソールで「YouTube API key not found」が表示される場合
- `.env` ファイルの設定を確認
- 開発サーバーを再起動

### チャンネルが見つからないエラー

- チャンネル ID が正しいか確認
- チャンネルが公開設定になっているか確認

### API制限エラー

- Google Cloud Console でクォータ使用量を確認
- 必要に応じてクォータの増加を申請

## 8. テスト用チャンネル（推奨）

動作確認には以下の公開チャンネルを使用できます：

```json
{
  "id": "UC_x5XG1OV2P6uZZ5FSM9Ttw",
  "name": "Google Developers",
  "description": "Google の開発者向けコンテンツ"
}
```
