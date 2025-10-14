# クイックデプロイガイド

このガイドでは、個人ポータルサイトを最短時間でAWSにデプロイする手順を説明します。

## 前提条件

- Node.js 18以上がインストール済み
- AWSアカウントを持っている
- YouTube Data API v3キーを取得済み

## 🚀 5分でデプロイ

### 1. プロジェクトのセットアップ

```bash
# 依存関係のインストール
npm install

# 本番環境の設定
npm run env:prod
```

### 2. AWS認証情報の設定

```bash
# AWS CLIの設定
aws configure
# または環境変数で設定
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1
```

### 3. 環境変数の設定

`.env.production`ファイルを編集：

```bash
VITE_YOUTUBE_API_KEY=your_actual_youtube_api_key
VITE_APP_TITLE=Your Name - Personal Portal
VITE_APP_DESCRIPTION=Your personal description
```

### 4. AWSインフラの自動セットアップ

```bash
# S3バケットとCloudFrontを自動作成
npm run aws:setup
```

### 5. デプロイ実行

```bash
# 完全デプロイメント
npm run deploy:full
```

### 6. 確認

```bash
# デプロイメントステータスの確認
npm run deploy:status
```

## 🔧 GitHub Actions自動デプロイ

### 1. GitHubリポジトリのSecrets設定

`Settings > Secrets and variables > Actions`で以下を設定：

**Secrets:**

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `VITE_YOUTUBE_API_KEY`
- `S3_BUCKET_NAME`
- `CLOUDFRONT_DISTRIBUTION_ID`

**Variables:**

- `VITE_APP_TITLE`
- `VITE_APP_DESCRIPTION`

### 2. 自動デプロイの有効化

```bash
# mainブランチにプッシュすると自動デプロイ
git add .
git commit -m "Initial deployment setup"
git push origin main
```

## 📋 チェックリスト

- [ ] Node.js 18以上インストール済み
- [ ] AWS CLIインストール・設定済み
- [ ] YouTube Data API v3キー取得済み
- [ ] `.env.production`ファイル設定済み
- [ ] `npm run aws:setup`実行済み
- [ ] `npm run deploy:full`実行済み
- [ ] `npm run deploy:status`で確認済み
- [ ] GitHubリポジトリのSecrets設定済み

## 🆘 トラブルシューティング

### よくある問題

1. **AWS認証エラー**

   ```bash
   aws sts get-caller-identity  # 認証確認
   ```

2. **S3バケット名の重複**
   - グローバルに一意な名前を選択
   - `scripts/aws-deploy-config.json`で変更

3. **YouTube API制限**
   - Google Cloud Consoleで使用量確認
   - 必要に応じてクォータ増加申請

4. **CloudFrontデプロイが遅い**
   - 通常5-15分かかります
   - `npm run deploy:status`で進捗確認

### デバッグコマンド

```bash
# 環境変数の確認
npm run env:validate

# ドライランテスト
npm run deploy:dry-run

# 詳細なステータス確認
npm run aws:status

# ビルド検証
npm run deploy:verify
```

## 📚 詳細ドキュメント

- [完全なデプロイメントガイド](docs/DEPLOYMENT.md)
- [GitHub Secretsテンプレート](github-secrets-template.md)
- [パフォーマンス最適化](PERFORMANCE_OPTIMIZATIONS.md)

## 🎉 デプロイ完了後

1. CloudFrontのURLでサイトにアクセス
2. YouTube動画が正しく表示されることを確認
3. レスポンシブデザインをテスト
4. パフォーマンステストを実行：`npm run test:performance`

---

**注意**: 初回デプロイ後、CloudFrontの変更が全世界に反映されるまで5-15分かかる場合があります。
