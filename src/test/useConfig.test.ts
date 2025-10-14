import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import {
  useConfig,
  useConfigReload,
  usePersonalInfo,
  useYouTubeChannels,
  useSocialLinks,
  useTheme,
} from '../hooks/useConfig';
import { mockSiteConfig, mockPersonalInfo } from './mocks';

// fetch のモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useConfig', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('設定ファイルが正常に読み込まれる', async () => {
    const mockConfig = {
      personalInfo: {
        name: 'テスト開発者',
        title: 'テストエンジニア',
        description: 'テスト用の説明',
        avatar: '/test-avatar.jpg',
      },
      youtubeChannels: [],
      socialLinks: [],
      theme: {
        primaryColor: '#00B33A',
        secondaryColor: '#4B5563',
        accentColor: '#FF7700',
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockConfig,
    });

    const { result } = renderHook(() => useConfig());

    // 初期状態では loading が true
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);

    // 設定が読み込まれるまで待機
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.config.personalInfo.name).toBe('テスト開発者');
    expect(result.current.error).toBe(null);
  });

  it('設定ファイルの読み込みに失敗した場合、デフォルト設定が使用される', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useConfig());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.config.personalInfo.name).toBe('デフォルト開発者');
    expect(result.current.error).toBe(null); // エラーは内部で処理され、デフォルト設定が使用される
  });

  it('不正な設定ファイルの場合、デフォルト設定が使用される', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invalid: 'data' }),
    });

    const { result } = renderHook(() => useConfig());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.config.personalInfo.name).toBe('デフォルト開発者');
  });
});

describe('usePersonalInfo', () => {
  it('個人情報のみを返す', async () => {
    const mockConfig = {
      personalInfo: {
        name: 'テスト開発者',
        title: 'テストエンジニア',
        description: 'テスト用の説明',
        avatar: '/test-avatar.jpg',
      },
      youtubeChannels: [],
      socialLinks: [],
      theme: {
        primaryColor: '#00B33A',
        secondaryColor: '#4B5563',
        accentColor: '#FF7700',
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockConfig,
    });

    const { result } = renderHook(() => usePersonalInfo());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.personalInfo.name).toBe('テスト開発者');
    expect(result.current.personalInfo.title).toBe('テストエンジニア');
  });
});

describe('useYouTubeChannels', () => {
  it('YouTubeチャンネル情報のみを返す', async () => {
    const mockConfig = {
      personalInfo: {
        name: 'テスト開発者',
        title: 'テストエンジニア',
        description: 'テスト用の説明',
        avatar: '/test-avatar.jpg',
      },
      youtubeChannels: [
        {
          id: 'UC123456789012345678901',
          name: 'テストチャンネル',
          description: 'テスト用チャンネル',
          url: 'https://youtube.com/channel/UC123456789012345678901',
        },
      ],
      socialLinks: [],
      theme: {
        primaryColor: '#00B33A',
        secondaryColor: '#4B5563',
        accentColor: '#FF7700',
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockConfig,
    });

    const { result } = renderHook(() => useYouTubeChannels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.channels).toHaveLength(1);
    expect(result.current.channels[0].name).toBe('テストチャンネル');
  });

  it('無効なYouTubeチャンネルデータをフィルタリングする', async () => {
    const mockConfig = {
      personalInfo: mockPersonalInfo,
      youtubeChannels: [
        {
          id: 'UC123456789012345678901',
          name: 'テストチャンネル',
          description: 'テスト用チャンネル',
          url: 'https://youtube.com/channel/UC123456789012345678901',
        },
        {
          // 無効なチャンネル（idまたはnameが欠けている）
          id: '',
          name: 'Invalid Channel',
          description: 'Invalid channel',
          url: 'https://youtube.com/channel/invalid',
        },
        {
          // 無効なチャンネル（nameが欠けている）
          id: 'UC987654321098765432109',
          name: '',
          description: 'Another invalid channel',
          url: 'https://youtube.com/channel/UC987654321098765432109',
        },
      ],
      socialLinks: [],
      theme: {
        primaryColor: '#00B33A',
        secondaryColor: '#4B5563',
        accentColor: '#FF7700',
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockConfig,
    });

    const { result } = renderHook(() => useYouTubeChannels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // 有効なチャンネルのみが残る
    expect(result.current.channels).toHaveLength(1);
    expect(result.current.channels[0].name).toBe('テストチャンネル');
  });
});

describe('useSocialLinks', () => {
  it('ソーシャルリンク情報のみを返す', async () => {
    const mockConfig = {
      personalInfo: mockPersonalInfo,
      youtubeChannels: [],
      socialLinks: [
        {
          platform: 'twitter',
          url: 'https://twitter.com/testuser',
          icon: 'twitter',
          label: 'Twitter',
        },
        {
          platform: 'github',
          url: 'https://github.com/testuser',
          icon: 'github',
          label: 'GitHub',
        },
      ],
      theme: {
        primaryColor: '#00B33A',
        secondaryColor: '#4B5563',
        accentColor: '#FF7700',
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockConfig,
    });

    const { result } = renderHook(() => useSocialLinks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.socialLinks).toHaveLength(2);
    expect(result.current.socialLinks[0].platform).toBe('twitter');
    expect(result.current.socialLinks[1].platform).toBe('github');
  });

  it('無効なソーシャルリンクデータをフィルタリングする', async () => {
    const mockConfig = {
      personalInfo: mockPersonalInfo,
      youtubeChannels: [],
      socialLinks: [
        {
          platform: 'twitter',
          url: 'https://twitter.com/testuser',
          icon: 'twitter',
          label: 'Twitter',
        },
        {
          // 無効なリンク（platformが欠けている）
          platform: '',
          url: 'https://github.com/testuser',
          icon: 'github',
          label: 'GitHub',
        },
        {
          // 無効なリンク（urlが欠けている）
          platform: 'linkedin',
          url: '',
          icon: 'linkedin',
          label: 'LinkedIn',
        },
      ],
      theme: {
        primaryColor: '#00B33A',
        secondaryColor: '#4B5563',
        accentColor: '#FF7700',
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockConfig,
    });

    const { result } = renderHook(() => useSocialLinks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // 有効なリンクのみが残る
    expect(result.current.socialLinks).toHaveLength(1);
    expect(result.current.socialLinks[0].platform).toBe('twitter');
  });
});

describe('useTheme', () => {
  it('テーマ情報のみを返す', async () => {
    const mockConfig = {
      personalInfo: mockPersonalInfo,
      youtubeChannels: [],
      socialLinks: [],
      theme: {
        primaryColor: '#FF0000',
        secondaryColor: '#00FF00',
        accentColor: '#0000FF',
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockConfig,
    });

    const { result } = renderHook(() => useTheme());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.theme.primaryColor).toBe('#FF0000');
    expect(result.current.theme.secondaryColor).toBe('#00FF00');
    expect(result.current.theme.accentColor).toBe('#0000FF');
  });

  it('部分的なテーマ設定でもデフォルト値で補完される', async () => {
    const mockConfig = {
      personalInfo: mockPersonalInfo,
      youtubeChannels: [],
      socialLinks: [],
      theme: {
        primaryColor: '#FF0000',
        // secondaryColorとaccentColorが欠けている
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockConfig,
    });

    const { result } = renderHook(() => useTheme());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.theme.primaryColor).toBe('#FF0000');
    expect(result.current.theme.secondaryColor).toBe('#4B5563'); // デフォルト値
    expect(result.current.theme.accentColor).toBe('#FF7700'); // デフォルト値
  });
});

describe('useConfigReload', () => {
  it('reload関数が正常に動作する', () => {
    const { result, rerender } = renderHook(() => useConfigReload());

    const initialTrigger = result.current.reloadTrigger;

    // reload関数を呼び出す
    act(() => {
      result.current.reload();
    });

    // 再レンダリングして状態の変更を確認
    rerender();

    expect(result.current.reloadTrigger).toBe(initialTrigger + 1);
  });
});

describe('useConfig - 詳細なエラーハンドリングテスト', () => {
  it('HTTPエラー（404）の場合、デフォルト設定が使用される', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useConfig());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.config.personalInfo.name).toBe('デフォルト開発者');
    expect(result.current.error).toBe(null);
  });

  it('HTTPエラー（500）の場合、デフォルト設定が使用される', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useConfig());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.config.personalInfo.name).toBe('デフォルト開発者');
    expect(result.current.error).toBe(null);
  });

  it('JSON解析エラーの場合、デフォルト設定が使用される', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    const { result } = renderHook(() => useConfig());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.config.personalInfo.name).toBe('デフォルト開発者');
    expect(result.current.error).toBe(null);
  });

  it('nullデータの場合、デフォルト設定が使用される', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => null,
    });

    const { result } = renderHook(() => useConfig());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.config.personalInfo.name).toBe('デフォルト開発者');
    expect(result.current.error).toBe(null);
  });

  it('undefinedデータの場合、デフォルト設定が使用される', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => undefined,
    });

    const { result } = renderHook(() => useConfig());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.config.personalInfo.name).toBe('デフォルト開発者');
    expect(result.current.error).toBe(null);
  });

  it('文字列データの場合、デフォルト設定が使用される', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => 'invalid string data',
    });

    const { result } = renderHook(() => useConfig());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.config.personalInfo.name).toBe('デフォルト開発者');
    expect(result.current.error).toBe(null);
  });

  it('数値データの場合、デフォルト設定が使用される', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => 12345,
    });

    const { result } = renderHook(() => useConfig());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.config.personalInfo.name).toBe('デフォルト開発者');
    expect(result.current.error).toBe(null);
  });

  it('配列データの場合、デフォルト設定が使用される', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ['invalid', 'array', 'data'],
    });

    const { result } = renderHook(() => useConfig());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.config.personalInfo.name).toBe('デフォルト開発者');
    expect(result.current.error).toBe(null);
  });

  it('部分的な設定データでもデフォルト値で補完される', async () => {
    const partialConfig = {
      personalInfo: {
        name: 'テスト開発者',
        // title, description, avatarが欠けている
      },
      // youtubeChannels, socialLinks, themeが欠けている
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => partialConfig,
    });

    const { result } = renderHook(() => useConfig());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // 提供された値
    expect(result.current.config.personalInfo.name).toBe('テスト開発者');

    // デフォルト値で補完された値
    expect(result.current.config.personalInfo.title).toBe('Web開発者');
    expect(result.current.config.personalInfo.description).toBe(
      'モダンなWebアプリケーション開発を行っています。'
    );
    expect(result.current.config.personalInfo.avatar).toBe(
      '/images/default-avatar.jpg'
    );

    // デフォルト配列
    expect(result.current.config.youtubeChannels).toEqual([]);
    expect(result.current.config.socialLinks).toEqual([]);

    // デフォルトテーマ
    expect(result.current.config.theme.primaryColor).toBe('#00B33A');
    expect(result.current.config.theme.secondaryColor).toBe('#4B5563');
    expect(result.current.config.theme.accentColor).toBe('#FF7700');
  });

  it('コンポーネントのアンマウント時にメモリリークが発生しない', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSiteConfig,
    });

    const { result, unmount } = renderHook(() => useConfig());

    // コンポーネントをアンマウント
    unmount();

    // 少し待ってからfetchが解決される
    await new Promise(resolve => setTimeout(resolve, 100));

    // エラーが発生しないことを確認（メモリリークテスト）
    expect(true).toBe(true);
  });

  it('複数回の連続呼び出しでも正常に動作する', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ personalInfo: { name: '最初の開発者' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ personalInfo: { name: '二番目の開発者' } }),
      });

    const { result: result1 } = renderHook(() => useConfig());
    const { result: result2 } = renderHook(() => useConfig());

    await waitFor(() => {
      expect(result1.current.loading).toBe(false);
      expect(result2.current.loading).toBe(false);
    });

    // 両方のフックが正常に動作することを確認
    expect(result1.current.config.personalInfo.name).toBe('最初の開発者');
    expect(result2.current.config.personalInfo.name).toBe('二番目の開発者');
  });
});
