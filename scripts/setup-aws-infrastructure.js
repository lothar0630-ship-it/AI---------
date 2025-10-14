#!/usr/bin/env node

/**
 * AWS Infrastructure Setup Script
 * S3バケットとCloudFrontディストリビューションを作成します
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 設定ファイルを読み込み
const configPath = path.join(__dirname, 'aws-deploy-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const { aws } = config;
const bucketName = aws.s3.bucketName;
const region = aws.region;

console.log('🚀 AWS インフラストラクチャのセットアップを開始します...');
console.log(`📦 バケット名: ${bucketName}`);
console.log(`🌍 リージョン: ${region}`);

async function setupInfrastructure() {
  try {
    // 1. S3バケットの存在確認
    console.log('\n📁 S3バケットの存在確認中...');
    try {
      execSync(`aws s3 ls s3://${bucketName}`, { stdio: 'pipe' });
      console.log('✅ S3バケットは既に存在します');
    } catch (error) {
      console.log('📦 S3バケットが存在しません。作成します...');

      // S3バケットを作成
      if (region === 'us-east-1') {
        execSync(`aws s3 mb s3://${bucketName}`, { stdio: 'inherit' });
      } else {
        execSync(`aws s3 mb s3://${bucketName} --region ${region}`, {
          stdio: 'inherit',
        });
      }
      console.log('✅ S3バケットを作成しました');
    }

    // 2. バケットポリシーの設定
    console.log('\n🔒 バケットポリシーを設定中...');
    const policyFile = path.join(__dirname, 'temp-bucket-policy.json');
    fs.writeFileSync(policyFile, JSON.stringify(aws.s3.bucketPolicy, null, 2));

    execSync(
      `aws s3api put-bucket-policy --bucket ${bucketName} --policy file://${policyFile}`,
      { stdio: 'inherit' }
    );
    fs.unlinkSync(policyFile); // 一時ファイルを削除
    console.log('✅ バケットポリシーを設定しました');

    // 3. ウェブサイト設定
    console.log('\n🌐 ウェブサイト設定を適用中...');
    const websiteConfig = aws.s3.websiteConfiguration;
    const websiteConfigFile = path.join(__dirname, 'temp-website-config.json');
    fs.writeFileSync(websiteConfigFile, JSON.stringify(websiteConfig, null, 2));

    execSync(
      `aws s3api put-bucket-website --bucket ${bucketName} --website-configuration file://${websiteConfigFile}`,
      { stdio: 'inherit' }
    );
    fs.unlinkSync(websiteConfigFile); // 一時ファイルを削除
    console.log('✅ ウェブサイト設定を適用しました');

    // 4. パブリックアクセスブロック設定を無効化（静的ウェブサイトホスティングのため）
    console.log('\n🔓 パブリックアクセス設定を調整中...');
    try {
      execSync(
        `aws s3api put-public-access-block --bucket ${bucketName} --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"`,
        { stdio: 'inherit' }
      );
      console.log('✅ パブリックアクセス設定を調整しました');
    } catch (error) {
      console.log(
        '⚠️  パブリックアクセス設定の調整に失敗しました（既に設定済みの可能性があります）'
      );
    }

    // 5. CloudFrontディストリビューションの確認（オプション）
    console.log('\n☁️  CloudFrontディストリビューションの確認中...');
    try {
      const distributions = execSync(
        'aws cloudfront list-distributions --query "DistributionList.Items[?Comment==\'Personal Portal Site Distribution\'].Id" --output text',
        { encoding: 'utf8' }
      );
      if (distributions.trim()) {
        console.log(
          `✅ CloudFrontディストリビューションが見つかりました: ${distributions.trim()}`
        );
        console.log(
          '💡 GitHub SecretsのCLOUDFRONT_DISTRIBUTION_IDにこのIDを設定してください'
        );
      } else {
        console.log('⚠️  CloudFrontディストリビューションが見つかりません');
        console.log(
          '💡 AWSコンソールで手動作成するか、AWS CLIで作成してください'
        );
      }
    } catch (error) {
      console.log('⚠️  CloudFrontディストリビューションの確認に失敗しました');
    }

    console.log('\n🎉 AWS インフラストラクチャのセットアップが完了しました！');
    console.log('\n📋 次のステップ:');
    console.log('1. GitHub SecretsでAWS認証情報を設定');
    console.log('2. S3_BUCKET_NAME を設定:', bucketName);
    console.log('3. CloudFrontディストリビューションIDを設定（必要に応じて）');
    console.log('4. デプロイメントをテスト');
  } catch (error) {
    console.error('❌ セットアップ中にエラーが発生しました:', error.message);
    console.log('\n🔧 トラブルシューティング:');
    console.log('1. AWS CLIが正しく設定されているか確認');
    console.log('2. AWS認証情報が正しいか確認');
    console.log('3. 必要な権限があるか確認（S3、CloudFront）');
    process.exit(1);
  }
}

// スクリプトが直接実行された場合
if (require.main === module) {
  setupInfrastructure();
}

module.exports = { setupInfrastructure };
