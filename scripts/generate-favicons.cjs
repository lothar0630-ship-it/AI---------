#!/usr/bin/env node

/**
 * Favicon Generation Script
 * 既存の画像から複数サイズのファビコンを生成します
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 ファビコン生成ガイド');
console.log('==================');

const publicImagesDir = path.join(process.cwd(), 'public', 'images');
const sourceImagePath = path.join(publicImagesDir, 'avatar.png');

// 必要なファビコンサイズ
const faviconSizes = [
  { name: 'favicon-16x16.png', size: '16x16' },
  { name: 'favicon-32x32.png', size: '32x32' },
  { name: 'apple-touch-icon.png', size: '180x180' },
  { name: 'android-chrome-192x192.png', size: '192x192' },
  { name: 'android-chrome-512x512.png', size: '512x512' },
];

function generateFaviconGuide() {
  console.log('📋 必要なファビコンファイル:');
  console.log('');

  faviconSizes.forEach(favicon => {
    console.log(`   ${favicon.name} (${favicon.size})`);
  });

  console.log('');
  console.log('🔧 生成方法:');
  console.log('');
  console.log('方法1: オンラインツールを使用（推奨）');
  console.log('   1. https://favicon.io/ にアクセス');
  console.log('   2. "PNG to ICO" または "Text to Icon" を選択');
  console.log(`   3. ソース画像をアップロード: ${sourceImagePath}`);
  console.log('   4. 生成されたファイルをダウンロード');
  console.log('   5. public/images/ フォルダに配置');
  console.log('');

  console.log('方法2: ImageMagickを使用（コマンドライン）');
  console.log('   # ImageMagickをインストール後、以下を実行:');
  faviconSizes.forEach(favicon => {
    console.log(
      `   magick ${sourceImagePath} -resize ${favicon.size} public/images/${favicon.name}`
    );
  });
  console.log('');

  console.log('方法3: 手動作成');
  console.log('   1. 画像編集ソフト（Photoshop、GIMP等）で画像を開く');
  console.log('   2. 各サイズにリサイズして保存');
  console.log('   3. public/images/ フォルダに配置');
  console.log('');

  console.log('📁 ファイル配置場所:');
  console.log(`   ${publicImagesDir}/`);
  console.log('');

  console.log('✅ 配置後の確認:');
  console.log('   npm run dev');
  console.log('   ブラウザのタブでファビコンが表示されることを確認');
  console.log('');

  // SVGファビコンの作成例
  console.log('🎯 SVGファビコンの作成例:');
  console.log('');

  const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="#3B82F6"/>
  <text x="50" y="60" font-family="Arial, sans-serif" font-size="40" font-weight="bold" text-anchor="middle" fill="white">L</text>
</svg>`;

  console.log('   以下の内容で public/images/favicon.svg を作成:');
  console.log('   ----------------------------------------');
  console.log(svgFavicon);
  console.log('   ----------------------------------------');
  console.log('');

  // SVGファビコンを自動生成
  const svgPath = path.join(publicImagesDir, 'favicon.svg');
  try {
    fs.writeFileSync(svgPath, svgFavicon);
    console.log(`✅ SVGファビコンを生成しました: ${svgPath}`);
  } catch (error) {
    console.log(`⚠️  SVGファビコンの生成に失敗しました: ${error.message}`);
  }

  console.log('');
  console.log('🔍 現在のファイル状況:');

  // 現在のファイル状況をチェック
  faviconSizes.forEach(favicon => {
    const filePath = path.join(publicImagesDir, favicon.name);
    const exists = fs.existsSync(filePath);
    const status = exists ? '✅' : '❌';
    console.log(`   ${status} ${favicon.name}`);
  });

  const svgExists = fs.existsSync(svgPath);
  const svgStatus = svgExists ? '✅' : '❌';
  console.log(`   ${svgStatus} favicon.svg`);

  console.log('');
  console.log('📝 次のステップ:');
  console.log('1. 不足しているファビコンファイルを生成・配置');
  console.log('2. npm run dev でローカル確認');
  console.log('3. デプロイしてブラウザタブのアイコンを確認');
}

// ファビコンファイルの検証
function validateFavicons() {
  console.log('🔍 ファビコンファイルの検証中...');

  let allExists = true;

  faviconSizes.forEach(favicon => {
    const filePath = path.join(publicImagesDir, favicon.name);
    const exists = fs.existsSync(filePath);

    if (exists) {
      const stats = fs.statSync(filePath);
      console.log(`✅ ${favicon.name} (${(stats.size / 1024).toFixed(1)}KB)`);
    } else {
      console.log(`❌ ${favicon.name} - ファイルが見つかりません`);
      allExists = false;
    }
  });

  const svgPath = path.join(publicImagesDir, 'favicon.svg');
  const svgExists = fs.existsSync(svgPath);

  if (svgExists) {
    const stats = fs.statSync(svgPath);
    console.log(`✅ favicon.svg (${(stats.size / 1024).toFixed(1)}KB)`);
  } else {
    console.log(`❌ favicon.svg - ファイルが見つかりません`);
    allExists = false;
  }

  if (allExists) {
    console.log('');
    console.log('🎉 すべてのファビコンファイルが揃っています！');
  } else {
    console.log('');
    console.log('⚠️  不足しているファビコンファイルがあります');
    console.log('💡 npm run favicon:generate でガイドを確認してください');
  }

  return allExists;
}

// コマンドライン引数の処理
const command = process.argv[2];

if (command === 'validate') {
  validateFavicons();
} else {
  generateFaviconGuide();
}

module.exports = { generateFaviconGuide, validateFavicons };
