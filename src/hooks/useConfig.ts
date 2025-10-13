import { useState, useEffect } from 'react';
import {
  SiteConfig,
  PersonalInfo,
  YouTubeChannel,
  SocialLink,
  ThemeConfig,
} from '../types';

// デフォルト設定値
const defaultConfig: SiteConfig = {
  personalInfo: {
    name: 'デフォルト開発者',
    title: 'Web開発者',
    description: 'モダンなWebアプリケーション開発を行っています。',
    avatar: '/images/default-avatar.jpg',
  },
  youtubeChannels: [],
  socialLinks: [],
  theme: {
    primaryColor: '#00B33A',
    secondaryColor: '#4B5563',
    accentColor: '#FF7700',
  },
};

// 設定読み込み状態の型定義
interface ConfigState {
  config: SiteConfig;
  loading: boolean;
  error: string | null;
}

// 設定ファイルの検証関数
const validateConfig = (data: any): SiteConfig => {
  // 基本構造の検証
  if (!data || typeof data !== 'object') {
    throw new Error('設定ファイルの形式が正しくありません');
  }

  // personalInfo の検証
  const personalInfo: PersonalInfo = {
    name: data.personalInfo?.name || defaultConfig.personalInfo.name,
    title: data.personalInfo?.title || defaultConfig.personalInfo.title,
    description:
      data.personalInfo?.description || defaultConfig.personalInfo.description,
    avatar: data.personalInfo?.avatar || defaultConfig.personalInfo.avatar,
  };

  // youtubeChannels の検証
  const youtubeChannels: YouTubeChannel[] = Array.isArray(data.youtubeChannels)
    ? data.youtubeChannels
        .map((channel: any) => ({
          id: channel.id || '',
          name: channel.name || '',
          description: channel.description || '',
          url: channel.url || '',
          customUrl: channel.customUrl,
        }))
        .filter((channel: YouTubeChannel) => channel.id && channel.name)
    : defaultConfig.youtubeChannels;

  // socialLinks の検証
  const socialLinks: SocialLink[] = Array.isArray(data.socialLinks)
    ? data.socialLinks
        .map((link: any) => ({
          platform: link.platform || '',
          url: link.url || '',
          icon: link.icon || link.platform || '',
          label: link.label || link.platform || '',
        }))
        .filter((link: SocialLink) => link.platform && link.url)
    : defaultConfig.socialLinks;

  // theme の検証
  const theme: ThemeConfig = {
    primaryColor: data.theme?.primaryColor || defaultConfig.theme.primaryColor,
    secondaryColor:
      data.theme?.secondaryColor || defaultConfig.theme.secondaryColor,
    accentColor: data.theme?.accentColor || defaultConfig.theme.accentColor,
  };

  return {
    personalInfo,
    youtubeChannels,
    socialLinks,
    theme,
  };
};

// 設定ファイル読み込み関数
const loadConfig = async (): Promise<SiteConfig> => {
  try {
    const response = await fetch('/config.json');

    if (!response.ok) {
      throw new Error(
        `設定ファイルの読み込みに失敗しました: ${response.status}`
      );
    }

    const data = await response.json();
    return validateConfig(data);
  } catch (error) {
    console.warn(
      '設定ファイルの読み込みに失敗しました。デフォルト設定を使用します:',
      error
    );
    return defaultConfig;
  }
};

/**
 * サイト設定を管理するカスタムフック
 *
 * @returns {ConfigState} 設定データ、読み込み状態、エラー情報を含むオブジェクト
 *
 * @example
 * ```tsx
 * function App() {
 *   const { config, loading, error } = useConfig();
 *
 *   if (loading) return <div>読み込み中...</div>;
 *   if (error) return <div>エラー: {error}</div>;
 *
 *   return <div>{config.personalInfo.name}</div>;
 * }
 * ```
 */
export const useConfig = (): ConfigState => {
  const [state, setState] = useState<ConfigState>({
    config: defaultConfig,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchConfig = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        const config = await loadConfig();

        if (isMounted) {
          setState({
            config,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : '不明なエラーが発生しました';
          setState({
            config: defaultConfig,
            loading: false,
            error: errorMessage,
          });
        }
      }
    };

    fetchConfig();

    // クリーンアップ関数
    return () => {
      isMounted = false;
    };
  }, []);

  return state;
};

// 設定の再読み込み用フック
export const useConfigReload = () => {
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const reload = () => {
    setReloadTrigger(prev => prev + 1);
  };

  return { reload, reloadTrigger };
};

// 個別設定項目へのアクセス用ヘルパーフック
export const usePersonalInfo = () => {
  const { config, loading, error } = useConfig();
  return { personalInfo: config.personalInfo, loading, error };
};

export const useYouTubeChannels = () => {
  const { config, loading, error } = useConfig();
  return { channels: config.youtubeChannels, loading, error };
};

export const useSocialLinks = () => {
  const { config, loading, error } = useConfig();
  return { socialLinks: config.socialLinks, loading, error };
};

export const useTheme = () => {
  const { config, loading, error } = useConfig();
  return { theme: config.theme, loading, error };
};
