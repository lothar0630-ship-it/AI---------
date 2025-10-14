# デプロイメントガイド

## 概要

このドキュメントでは、個人ポータルサイトのAWSへのデプロイメント手順と自動化について説明します。

## 前提条件

### 必要なツール

- Node.js 18以上
- npm
- AWS CLI (v2推奨)
- Git

### AWS アカウント設定

1. AWS アカウントの作成
2. IAM ユーザーの作成（適切な権限付与）
3. S3 バケットの作成
4. CloudFront ディストリビューションの設定

## 環境設定

### 1. 環境変数の設定

本番環境用の環境変数を設定してください：

```bash
# .env.production
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here
VITE_APP_TITLE=Personal Portal Site
VITE_APP_DESCRIPTION=Modern personal portfolio and social media hub
VITE_DEV_MODE=false
VITE_NODE_ENV=production
```

### 2. AWS 認証情報の設定

```bash
# AWS CLI設定
aws configure

# または環境変数で設定
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1
```

## ローカルデプロイメント

### 1. 環境設定

```bash
# 本番環境の設定
npm run env:prod

# 開発環境の設定
npm run env:dev

# 環境変数の検証
npm run env:validate
```

### 2. AWS インフラストラクチャのセットアップ

```bash
# AWS認証情報の設定
aws configure

# S3バケットとCloudFrontの自動セットアップ
npm run aws:setup
```

### 3. ビルドスクリプトの実行

```bash
# 完全なプロダクションビルド
npm run build:prod

# または個別実行
npm run deploy:build
npm run deploy:verify

# ドライランでテスト（実際にはデプロイしない）
npm run deploy:dry-run

# 完全デプロイメント
npm run deploy:full
```

### 2. ビルド出力の確認

```bash
# ビルド情報の確認
cat dist/build-info.json

# 検証レポートの確認
cat dist/verification-report.json
```

## AWS S3 + CloudFront デプロイメント

### 1. S3 バケットの設定

```bash
# バケット作成
aws s3 mb s3://your-personal-portal-bucket

# 静的ウェブサイトホスティング有効化
aws s3 website s3://your-personal-portal-bucket \
  --index-document index.html \
  --error-document index.html

# パブリック読み取り権限設定
aws s3api put-bucket-policy \
  --bucket your-personal-portal-bucket \
  --policy file://scripts/aws-deploy-config.json
```

### 2. ファイルのアップロード

```bash
# HTMLファイル（キャッシュなし）
aws s3 sync dist/ s3://your-personal-portal-bucket \
  --cache-control "no-cache" \
  --include "*.html" \
  --include "*.json"

# アセットファイル（長期キャッシュ）
aws s3 sync dist/ s3://your-personal-portal-bucket \
  --cache-control "public, max-age=31536000" \
  --exclude "*.html" \
  --exclude "*.json"
```

### 3. CloudFront 設定

```bash
# ディストリビューション作成
aws cloudfront create-distribution \
  --distribution-config file://scripts/aws-deploy-config.json

# キャッシュ無効化
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

## GitHub Actions 自動デプロイ

### 1. シークレットの設定

GitHub リポジトリの Settings > Secrets and variables > Actions で以下を設定：

**Secrets:**

- `AWS_ACCESS_KEY_ID`: AWS アクセスキー
- `AWS_SECRET_ACCESS_KEY`: AWS シークレットキー
- `VITE_YOUTUBE_API_KEY`: YouTube Data API キー
- `S3_BUCKET_NAME`: S3 バケット名
- `CLOUDFRONT_DISTRIBUTION_ID`: CloudFront ディストリビューション ID

**Variables:**

- `VITE_APP_TITLE`: アプリケーションタイトル
- `VITE_APP_DESCRIPTION`: アプリケーション説明

### 2. ワークフローの実行

```bash
# mainブランチへのプッシュで自動実行
git push origin main

# 手動実行
# GitHub Actions タブから "Deploy to AWS S3 + CloudFront" を実行
```

## デプロイメント検証

### 自動検証項目

1. **ビルド出力検証**
   - 必要なファイルの存在確認
   - アセットファイルの検証
   - バンドルサイズチェック

2. **設定検証**
   - 環境変数の確認
   - プロダクション環境設定

3. **セキュリティ検証**
   - 機密ファイルの除外確認
   - セキュリティヘッダーの確認

### 手動検証項目

1. **機能テスト**
   - サイトの表示確認
   - YouTube API連携確認
   - レスポンシブデザイン確認

2. **パフォーマンステスト**
   - ページ読み込み速度
   - バンドルサイズ
   - CDN配信確認

## トラブルシューティング

### よくある問題

1. **ビルドエラー**

   ```bash
   # 依存関係の再インストール
   rm -rf node_modules package-lock.json
   npm install

   # TypeScriptエラーの確認
   npm run lint
   ```

2. **AWS認証エラー**

   ```bash
   # 認証情報の確認
   aws sts get-caller-identity

   # 権限の確認
   aws iam get-user
   ```

3. **CloudFront キャッシュ問題**
   ```bash
   # キャッシュ無効化
   aws cloudfront create-invalidation \
     --distribution-id YOUR_DISTRIBUTION_ID \
     --paths "/*"
   ```

### ログの確認

```bash
# ビルドログの確認
npm run deploy:build 2>&1 | tee build.log

# 検証ログの確認
npm run deploy:verify 2>&1 | tee verify.log
```

## パフォーマンス最適化

### 1. バンドル最適化

- コード分割の実装
- 不要な依存関係の削除
- Tree shaking の活用

### 2. CDN 最適化

- 適切なキャッシュヘッダー設定
- Gzip圧縮の有効化
- HTTP/2 の活用

### 3. 画像最適化

- WebP形式の使用
- 遅延読み込みの実装
- レスポンシブ画像の設定

## セキュリティ考慮事項

### 1. 機密情報の管理

- 環境変数での API キー管理
- .env ファイルの除外
- GitHub Secrets の使用

### 2. HTTPS 設定

- CloudFront での HTTPS 強制
- セキュリティヘッダーの設定
- HSTS の有効化

### 3. アクセス制御

- S3 バケットポリシーの適切な設定
- CloudFront OAI の使用
- 不要な権限の削除

## デプロイメント監視

### 1. ステータス確認

```bash
# 全体的なデプロイメントステータス
npm run deploy:status

# AWS固有のステータス
npm run aws:status

# 特定のCloudFront無効化の監視
node scripts/deploy-status.cjs monitor-invalidation <invalidation-id>
```

### 2. ヘルスチェック

```bash
# 環境変数の確認
npm run env:validate

# 環境ファイルの一覧
npm run env:list

# ビルド出力の検証
npm run deploy:verify
```

## 監視とメンテナンス

### 1. 監視項目

- サイトの可用性（S3 + CloudFront）
- パフォーマンスメトリクス
- エラー率
- CloudFront無効化ステータス
- AWS使用量とコスト

### 2. 定期メンテナンス

- 依存関係の更新
- セキュリティパッチの適用
- パフォーマンスの最適化
- APIキーのローテーション
- CloudFrontキャッシュの最適化

### 3. バックアップ

- ソースコードのバージョン管理
- 設定ファイルのバックアップ
- デプロイメント履歴の管理
- AWS設定のバックアップ
