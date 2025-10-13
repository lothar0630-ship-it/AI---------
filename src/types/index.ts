// 基本的な個人情報の型定義
export interface PersonalInfo {
  name: string;
  title: string;
  description: string;
  avatar: string;
}

// YouTubeチャンネルの型定義
export interface YouTubeChannel {
  id: string;
  name: string;
  description: string;
  url: string;
  customUrl?: string;
}

// YouTube動画の型定義
export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  url: string;
}

// ソーシャルリンクの型定義
export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
  label: string;
}

// テーマ設定の型定義
export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

// サイト全体の設定の型定義
export interface SiteConfig {
  personalInfo: PersonalInfo;
  youtubeChannels: YouTubeChannel[];
  socialLinks: SocialLink[];
  theme: ThemeConfig;
}

// YouTube API関連の型をエクスポート
export * from './youtube';
