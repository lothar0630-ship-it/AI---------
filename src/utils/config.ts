import { SiteConfig } from '../types';

/**
 * 設定ファイルの深いマージを行う関数
 * デフォルト設定と読み込んだ設定をマージし、不足している項目を補完する
 */
export const mergeConfig = (
  defaultConfig: SiteConfig,
  userConfig: Partial<SiteConfig>
): SiteConfig => {
  return {
    personalInfo: {
      ...defaultConfig.personalInfo,
      ...userConfig.personalInfo,
    },
    youtubeChannels:
      userConfig.youtubeChannels || defaultConfig.youtubeChannels,
    socialLinks: userConfig.socialLinks || defaultConfig.socialLinks,
    theme: {
      ...defaultConfig.theme,
      ...userConfig.theme,
    },
  };
};

/**
 * 設定値の妥当性をチェックする関数
 */
export const validateConfigValue = {
  /**
   * URLの妥当性をチェック
   */
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * カラーコードの妥当性をチェック（HEX形式）
   */
  isValidHexColor: (color: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  },

  /**
   * YouTube チャンネルIDの妥当性をチェック
   */
  isValidYouTubeChannelId: (channelId: string): boolean => {
    return /^UC[a-zA-Z0-9_-]{22}$/.test(channelId);
  },

  /**
   * 必須フィールドの存在チェック
   */
  isRequired: (value: any): boolean => {
    return value !== null && value !== undefined && value !== '';
  },
};

/**
 * 設定ファイルのスキーマ検証
 */
export const validateConfigSchema = (
  config: any
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // personalInfo の検証
  if (!config.personalInfo) {
    errors.push('personalInfo が必要です');
  } else {
    if (!validateConfigValue.isRequired(config.personalInfo.name)) {
      errors.push('personalInfo.name が必要です');
    }
    if (!validateConfigValue.isRequired(config.personalInfo.title)) {
      errors.push('personalInfo.title が必要です');
    }
  }

  // youtubeChannels の検証
  if (config.youtubeChannels && Array.isArray(config.youtubeChannels)) {
    config.youtubeChannels.forEach((channel: any, index: number) => {
      if (!validateConfigValue.isRequired(channel.id)) {
        errors.push(`youtubeChannels[${index}].id が必要です`);
      } else if (!validateConfigValue.isValidYouTubeChannelId(channel.id)) {
        errors.push(`youtubeChannels[${index}].id の形式が正しくありません`);
      }

      if (!validateConfigValue.isRequired(channel.name)) {
        errors.push(`youtubeChannels[${index}].name が必要です`);
      }

      if (channel.url && !validateConfigValue.isValidUrl(channel.url)) {
        errors.push(`youtubeChannels[${index}].url の形式が正しくありません`);
      }
    });
  }

  // socialLinks の検証
  if (config.socialLinks && Array.isArray(config.socialLinks)) {
    config.socialLinks.forEach((link: any, index: number) => {
      if (!validateConfigValue.isRequired(link.platform)) {
        errors.push(`socialLinks[${index}].platform が必要です`);
      }

      if (!validateConfigValue.isRequired(link.url)) {
        errors.push(`socialLinks[${index}].url が必要です`);
      } else if (!validateConfigValue.isValidUrl(link.url)) {
        errors.push(`socialLinks[${index}].url の形式が正しくありません`);
      }
    });
  }

  // theme の検証
  if (config.theme) {
    const themeColors = ['primaryColor', 'secondaryColor', 'accentColor'];
    themeColors.forEach(colorKey => {
      const color = config.theme[colorKey];
      if (color && !validateConfigValue.isValidHexColor(color)) {
        errors.push(
          `theme.${colorKey} の形式が正しくありません（HEX形式で入力してください）`
        );
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * 設定ファイルのローカルストレージキー
 */
export const CONFIG_STORAGE_KEY = 'personal-portal-config';

/**
 * 設定をローカルストレージに保存
 */
export const saveConfigToStorage = (config: SiteConfig): void => {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.warn('設定のローカルストレージへの保存に失敗しました:', error);
  }
};

/**
 * ローカルストレージから設定を読み込み
 */
export const loadConfigFromStorage = (): SiteConfig | null => {
  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('ローカルストレージからの設定読み込みに失敗しました:', error);
    return null;
  }
};

/**
 * ローカルストレージの設定をクリア
 */
export const clearConfigFromStorage = (): void => {
  try {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
  } catch (error) {
    console.warn('ローカルストレージの設定クリアに失敗しました:', error);
  }
};
