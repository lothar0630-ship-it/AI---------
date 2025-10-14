# セキュリティセットアップガイド

## 🔒 環境変数の安全な管理

### 重要な注意事項

⚠️ **絶対にやってはいけないこと**

- `.env.production` ファイルに実際のAPIキーを書いてGitにコミット
- 認証情報をソースコードに直接記述
- 機密情報をGitHubに公開

✅ **正しい方法**

- GitHub Secrets で認証情報を管理
- ローカル開発では `.env.local` を使用
- テンプレートファイルのみをGitで管理

## 📋 セットアップ手順

### 1. ローカル開発環境

```bash
# .env.production.template をコピー
cp .env.production.template .env.production

# 実際のAPIキーを設定（このファイルはGitで管理されません）
# .env.production を編集して実際の値を入力
```

### 2. GitHub Secrets の設定

GitHubリポジトリの `Settings > Secrets and variables > Actions` で設定：

**Secrets（機密情報）:**

- `AWS_ACCESS_KEY_ID`: AWS IAMユーザーのアクセスキー
- `AWS_SECRET_ACCESS_KEY`: AWS IAMユーザーのシークレットキー
- `VITE_YOUTUBE_API_KEY`: YouTube Data API v3 キー
- `S3_BUCKET_NAME`: S3バケット名
- `CLOUDFRONT_DISTRIBUTION_ID`: CloudFrontディストリビューションID

**Variables（公開情報）:**

- `VITE_APP_TITLE`: アプリケーションのタイトル
- `VITE_APP_DESCRIPTION`: アプリケーションの説明

### 3. 設定の確認

```bash
# 環境変数が正しく除外されているか確認
git status

# .env.production が表示されないことを確認
# 表示される場合は以下を実行：
git rm --cached .env.production
git commit -m "Remove .env.production from tracking"
```

## 🛡️ セキュリティチェックリスト

- [ ] `.gitignore` に `.env.*` が含まれている
- [ ] `.env.production` がGitで追跡されていない
- [ ] GitHub Secrets に全ての機密情報が設定済み
- [ ] ローカルの `.env.production` に実際のAPIキーが設定済み
- [ ] GitHub Actions が Secrets から環境変数を取得している

## 🚨 セキュリティインシデント対応

もし誤って認証情報をGitHubに公開してしまった場合：

1. **即座にAPIキーを無効化**
   - YouTube API: Google Cloud Console で無効化
   - AWS: IAM でアクセスキーを無効化

2. **新しいAPIキーを生成**
   - 新しいキーを生成して GitHub Secrets に設定

3. **Gitの履歴から削除**

   ```bash
   # 履歴から完全に削除（注意：強制プッシュが必要）
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch .env.production' \
     --prune-empty --tag-name-filter cat -- --all

   git push origin --force --all
   ```

## 📚 参考資料

- [GitHub Secrets の使い方](https://docs.github.com/ja/actions/security-guides/encrypted-secrets)
- [AWS IAM ベストプラクティス](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [環境変数のセキュリティ](https://12factor.net/config)
