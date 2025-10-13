import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useYouTubeVideos,
  useYouTubeAvailability,
  useMultipleYouTubeVideos,
  useYouTubeChannel,
  useMultipleYouTubeChannels,
  useYouTubeData,
} from '../hooks/useYouTubeVideos';

// YouTube API のモック
const mockYouTubeResponse = {
  items: [
    {
      id: { videoId: 'test-video-id' },
      snippet: {
        title: 'Test Video Title',
        description: 'Test video description',
        publishedAt: '2024-01-01T00:00:00Z',
        thumbnails: {
          medium: {
            url: 'https://example.com/thumbnail.jpg',
            width: 320,
            height: 180,
          },
          default: {
            url: 'https://example.com/thumbnail-default.jpg',
            width: 120,
            height: 90,
          },
        },
      },
    },
  ],
};

// fetch のモック
global.fetch = vi.fn();

// 元の環境変数を保存
const originalEnv = import.meta.env;

// テスト用の QueryClient プロバイダー
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useYouTubeVideos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // テスト用の環境変数を設定
    Object.defineProperty(import.meta, 'env', {
      value: {
        ...originalEnv,
        VITE_YOUTUBE_API_KEY: 'test-api-key',
      },
      writable: true,
    });
  });

  afterEach(() => {
    // 環境変数を復元
    Object.defineProperty(import.meta, 'env', {
      value: originalEnv,
      writable: true,
    });
  });

  it('should return availability status correctly', () => {
    const { result } = renderHook(() => useYouTubeAvailability());

    expect(result.current.isAvailable).toBe(true);
    expect(result.current.hasApiKey).toBe(true);
  });

  it('should fetch YouTube videos successfully', async () => {
    // fetch のモック設定
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockYouTubeResponse,
    });

    const { result } = renderHook(
      () => useYouTubeVideos('test-channel-id', 1),
      { wrapper: createWrapper() }
    );

    // 初期状態の確認
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBe(null);

    // データ取得完了まで待機
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // 結果の確認
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data![0]).toEqual({
      id: 'test-video-id',
      title: 'Test Video Title',
      description: 'Test video description',
      thumbnail: 'https://example.com/thumbnail.jpg',
      publishedAt: '2024-01-01T00:00:00Z',
      url: 'https://www.youtube.com/watch?v=test-video-id',
    });
    expect(result.current.error).toBe(null);
  });

  it('should handle API errors gracefully', async () => {
    // エラーレスポンスのモック
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: {
          code: 403,
          message:
            'The request cannot be completed because you have exceeded your quota.',
        },
      }),
    });

    const { result } = renderHook(
      () => useYouTubeVideos('test-channel-id', 1),
      { wrapper: createWrapper() }
    );

    // エラー状態まで待機
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // エラー状態の確認
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeTruthy();
  });

  it('should handle network errors', async () => {
    // ネットワークエラーのモック
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(
      () => useYouTubeVideos('test-channel-id', 1),
      { wrapper: createWrapper() }
    );

    // エラー状態まで待機
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // エラー状態の確認
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeTruthy();
  });

  it('should not fetch when API key is missing', () => {
    // API キーなしの環境をモック
    Object.defineProperty(import.meta, 'env', {
      value: {
        ...originalEnv,
        VITE_YOUTUBE_API_KEY: undefined,
      },
      writable: true,
    });

    const { result } = renderHook(
      () => useYouTubeVideos('test-channel-id', 1),
      { wrapper: createWrapper() }
    );

    // クエリが無効化されていることを確認
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});

describe('useMultipleYouTubeVideos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // テスト用の環境変数を設定
    Object.defineProperty(import.meta, 'env', {
      value: {
        ...originalEnv,
        VITE_YOUTUBE_API_KEY: 'test-api-key',
      },
      writable: true,
    });
  });

  afterEach(() => {
    // 環境変数を復元
    Object.defineProperty(import.meta, 'env', {
      value: originalEnv,
      writable: true,
    });
  });

  it('should fetch videos for multiple channels successfully', async () => {
    // 複数のチャンネルのレスポンスをモック
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: { videoId: 'video1' },
              snippet: {
                title: 'Video 1',
                description: 'Description 1',
                publishedAt: '2024-01-01T00:00:00Z',
                thumbnails: {
                  medium: { url: 'https://example.com/thumb1.jpg' },
                  default: { url: 'https://example.com/thumb1-default.jpg' },
                },
              },
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: { videoId: 'video2' },
              snippet: {
                title: 'Video 2',
                description: 'Description 2',
                publishedAt: '2024-01-02T00:00:00Z',
                thumbnails: {
                  medium: { url: 'https://example.com/thumb2.jpg' },
                  default: { url: 'https://example.com/thumb2-default.jpg' },
                },
              },
            },
          ],
        }),
      });

    const { result } = renderHook(
      () => useMultipleYouTubeVideos(['channel1', 'channel2'], 1),
      { wrapper: createWrapper() }
    );

    // データ取得完了まで待機
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // 結果の確認
    expect(result.current.data).toHaveProperty('channel1');
    expect(result.current.data).toHaveProperty('channel2');
    expect(result.current.data.channel1).toHaveLength(1);
    expect(result.current.data.channel2).toHaveLength(1);
    expect(result.current.data.channel1[0].id).toBe('video1');
    expect(result.current.data.channel2[0].id).toBe('video2');
    expect(result.current.error).toBe(null);
  });

  it('should handle partial failures gracefully', async () => {
    // 1つ成功、1つ失敗のレスポンスをモック
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockYouTubeResponse,
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: {
            code: 404,
            message: 'Channel not found',
          },
        }),
      });

    const { result } = renderHook(
      () => useMultipleYouTubeVideos(['channel1', 'channel2'], 1),
      { wrapper: createWrapper() }
    );

    // データ取得完了まで待機
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // 結果の確認
    expect(result.current.data.channel1).toHaveLength(1);
    expect(result.current.data.channel2).toHaveLength(0);
    expect(result.current.error).toBeTruthy();
    expect(result.current.error!.channel2).toContain('Channel not found');
  });
});

describe('useYouTubeChannel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // テスト用の環境変数を設定
    Object.defineProperty(import.meta, 'env', {
      value: {
        ...originalEnv,
        VITE_YOUTUBE_API_KEY: 'test-api-key',
      },
      writable: true,
    });
  });

  afterEach(() => {
    // 環境変数を復元
    Object.defineProperty(import.meta, 'env', {
      value: originalEnv,
      writable: true,
    });
  });

  it('should fetch channel information successfully', async () => {
    const mockChannelResponse = {
      items: [
        {
          id: 'test-channel-id',
          snippet: {
            title: 'Test Channel',
            description: 'Test channel description',
            customUrl: '@testchannel',
          },
          statistics: {
            viewCount: '1000',
            subscriberCount: '100',
            videoCount: '10',
          },
        },
      ],
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockChannelResponse,
    });

    const { result } = renderHook(() => useYouTubeChannel('test-channel-id'), {
      wrapper: createWrapper(),
    });

    // データ取得完了まで待機
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // 結果の確認
    expect(result.current.data).toEqual({
      id: 'test-channel-id',
      name: 'Test Channel',
      description: 'Test channel description',
      url: 'https://www.youtube.com/channel/test-channel-id',
      customUrl: '@testchannel',
    });
    expect(result.current.error).toBe(null);
  });
});

describe('useMultipleYouTubeChannels', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // テスト用の環境変数を設定
    Object.defineProperty(import.meta, 'env', {
      value: {
        ...originalEnv,
        VITE_YOUTUBE_API_KEY: 'test-api-key',
      },
      writable: true,
    });
  });

  afterEach(() => {
    // 環境変数を復元
    Object.defineProperty(import.meta, 'env', {
      value: originalEnv,
      writable: true,
    });
  });

  it('should fetch multiple channels successfully', async () => {
    const mockChannel1Response = {
      items: [
        {
          id: 'channel1',
          snippet: {
            title: 'Channel 1',
            description: 'Description 1',
            customUrl: '@channel1',
          },
        },
      ],
    };

    const mockChannel2Response = {
      items: [
        {
          id: 'channel2',
          snippet: {
            title: 'Channel 2',
            description: 'Description 2',
            customUrl: '@channel2',
          },
        },
      ],
    };

    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockChannel1Response,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockChannel2Response,
      });

    const { result } = renderHook(
      () => useMultipleYouTubeChannels(['channel1', 'channel2']),
      { wrapper: createWrapper() }
    );

    // データ取得完了まで待機
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // 結果の確認
    expect(result.current.data).toHaveProperty('channel1');
    expect(result.current.data).toHaveProperty('channel2');
    expect(result.current.data.channel1.name).toBe('Channel 1');
    expect(result.current.data.channel2.name).toBe('Channel 2');
    expect(result.current.error).toBe(null);
  });
});

describe('useYouTubeData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // テスト用の環境変数を設定
    Object.defineProperty(import.meta, 'env', {
      value: {
        ...originalEnv,
        VITE_YOUTUBE_API_KEY: 'test-api-key',
      },
      writable: true,
    });
  });

  afterEach(() => {
    // 環境変数を復元
    Object.defineProperty(import.meta, 'env', {
      value: originalEnv,
      writable: true,
    });
  });

  it('should merge config data with API data', async () => {
    const configChannels = [
      {
        id: 'channel1',
        name: 'Config Channel 1',
        description: 'Config description 1',
        url: 'https://youtube.com/channel/channel1',
      },
    ];

    // API レスポンスをモック
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockYouTubeResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            {
              id: 'channel1',
              snippet: {
                title: 'API Channel 1',
                description: 'API description 1',
                customUrl: '@apichannel1',
              },
            },
          ],
        }),
      });

    const { result } = renderHook(() => useYouTubeData(configChannels), {
      wrapper: createWrapper(),
    });

    // データ取得完了まで待機
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // 結果の確認
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].name).toBe('API Channel 1'); // API データで上書き
    expect(result.current.data[0].description).toBe('API description 1');
    expect(result.current.data[0].videos).toHaveLength(1);
    expect(result.current.data[0].hasApiData).toBe(true);
  });
});

describe('useYouTubeAvailability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 環境変数を復元
    Object.defineProperty(import.meta, 'env', {
      value: originalEnv,
      writable: true,
    });
  });

  it('should return true when API key is available', () => {
    // API キーありの環境をモック
    Object.defineProperty(import.meta, 'env', {
      value: {
        ...originalEnv,
        VITE_YOUTUBE_API_KEY: 'test-api-key',
      },
      writable: true,
    });

    const { result } = renderHook(() => useYouTubeAvailability());

    expect(result.current.isAvailable).toBe(true);
    expect(result.current.hasApiKey).toBe(true);
  });

  it('should return false when API key is missing', () => {
    // API キーなしの環境をモック
    Object.defineProperty(import.meta, 'env', {
      value: {
        ...originalEnv,
        VITE_YOUTUBE_API_KEY: undefined,
      },
      writable: true,
    });

    const { result } = renderHook(() => useYouTubeAvailability());

    expect(result.current.isAvailable).toBe(false);
    expect(result.current.hasApiKey).toBe(false);
  });
});
