import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useYouTubeData } from '../hooks/useYouTubeVideos';
import { YouTubeChannel } from '../types';

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

// モックデータ
const mockChannels: YouTubeChannel[] = [
  {
    id: 'UC123456789',
    name: 'Config Channel 1',
    description: 'Config description for channel 1',
    url: 'https://youtube.com/channel/UC123456789',
  },
  {
    id: 'UC987654321',
    name: 'Config Channel 2',
    description: 'Config description for channel 2',
    url: 'https://youtube.com/channel/UC987654321',
  },
];

const mockVideoResponse1 = {
  items: [
    {
      id: { videoId: 'video123' },
      snippet: {
        title: 'Latest Video from Channel 1',
        description: 'Description of latest video from channel 1',
        publishedAt: '2024-01-15T10:00:00Z',
        thumbnails: {
          medium: {
            url: 'https://img.youtube.com/vi/video123/mqdefault.jpg',
            width: 320,
            height: 180,
          },
          default: {
            url: 'https://img.youtube.com/vi/video123/default.jpg',
            width: 120,
            height: 90,
          },
        },
      },
    },
  ],
};

const mockVideoResponse2 = {
  items: [
    {
      id: { videoId: 'video456' },
      snippet: {
        title: 'Latest Video from Channel 2',
        description: 'Description of latest video from channel 2',
        publishedAt: '2024-01-14T15:30:00Z',
        thumbnails: {
          medium: {
            url: 'https://img.youtube.com/vi/video456/mqdefault.jpg',
            width: 320,
            height: 180,
          },
          default: {
            url: 'https://img.youtube.com/vi/video456/default.jpg',
            width: 120,
            height: 90,
          },
        },
      },
    },
  ],
};

const mockChannelResponse1 = {
  items: [
    {
      id: 'UC123456789',
      snippet: {
        title: 'API Channel 1',
        description: 'Updated description from API for channel 1',
        customUrl: '@apichannel1',
      },
      statistics: {
        viewCount: '1000000',
        subscriberCount: '50000',
        videoCount: '100',
      },
    },
  ],
};

const mockChannelResponse2 = {
  items: [
    {
      id: 'UC987654321',
      snippet: {
        title: 'API Channel 2',
        description: 'Updated description from API for channel 2',
        customUrl: '@apichannel2',
      },
      statistics: {
        viewCount: '2000000',
        subscriberCount: '75000',
        videoCount: '150',
      },
    },
  ],
};

describe('YouTube API Integration Tests', () => {
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

  describe('useYouTubeData integration', () => {
    it('should successfully integrate config data with API data', async () => {
      // API レスポンスをモック（動画取得 → チャンネル情報取得の順）
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockVideoResponse1,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockVideoResponse2,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockChannelResponse1,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockChannelResponse2,
        });

      const { result } = renderHook(() => useYouTubeData(mockChannels), {
        wrapper: createWrapper(),
      });

      // 初期状態の確認
      expect(result.current.isLoading).toBe(true);

      // データ取得完了まで待機
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // 統合結果の確認
      expect(result.current.data).toHaveLength(2);

      // 1つ目のチャンネル
      const channel1 = result.current.data[0];
      expect(channel1.id).toBe('UC123456789');
      expect(channel1.name).toBe('API Channel 1'); // API データで上書き
      expect(channel1.description).toBe(
        'Updated description from API for channel 1'
      );
      expect(channel1.videos).toHaveLength(1);
      expect(channel1.videos[0].id).toBe('video123');
      expect(channel1.videos[0].title).toBe('Latest Video from Channel 1');
      expect(channel1.hasApiData).toBe(true);

      // 2つ目のチャンネル
      const channel2 = result.current.data[1];
      expect(channel2.id).toBe('UC987654321');
      expect(channel2.name).toBe('API Channel 2'); // API データで上書き
      expect(channel2.description).toBe(
        'Updated description from API for channel 2'
      );
      expect(channel2.videos).toHaveLength(1);
      expect(channel2.videos[0].id).toBe('video456');
      expect(channel2.videos[0].title).toBe('Latest Video from Channel 2');
      expect(channel2.hasApiData).toBe(true);

      // エラーがないことを確認
      expect(result.current.error.videos).toBe(null);
      expect(result.current.error.channels).toBe(null);
    });

    it('should handle API failures gracefully and fallback to config data', async () => {
      // 動画取得は成功、チャンネル情報取得は失敗
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockVideoResponse1,
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            error: {
              code: 403,
              message: 'Quota exceeded',
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockChannelResponse1,
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

      const { result } = renderHook(() => useYouTubeData(mockChannels), {
        wrapper: createWrapper(),
      });

      // データ取得完了まで待機
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // 結果の確認
      expect(result.current.data).toHaveLength(2);

      // 1つ目のチャンネル（成功）
      const channel1 = result.current.data[0];
      expect(channel1.name).toBe('API Channel 1'); // API データ
      expect(channel1.videos).toHaveLength(1);
      expect(channel1.hasApiData).toBe(true);

      // 2つ目のチャンネル（失敗、設定データにフォールバック）
      const channel2 = result.current.data[1];
      expect(channel2.name).toBe('Config Channel 2'); // 設定データ
      expect(channel2.videos).toHaveLength(0); // 動画取得失敗
      expect(channel2.hasApiData).toBe(false);

      // エラー情報の確認
      expect(result.current.error.videos).toBeTruthy();
      expect(result.current.error.channels).toBeTruthy();
    });

    it('should handle complete API failure and use only config data', async () => {
      // 全ての API 呼び出しが失敗
      (global.fetch as any)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useYouTubeData(mockChannels), {
        wrapper: createWrapper(),
      });

      // データ取得完了まで待機
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // 結果の確認
      expect(result.current.data).toHaveLength(2);

      // 設定データのみが使用されることを確認
      const channel1 = result.current.data[0];
      expect(channel1.name).toBe('Config Channel 1'); // 設定データ
      expect(channel1.description).toBe('Config description for channel 1');
      expect(channel1.videos).toHaveLength(0);
      expect(channel1.hasApiData).toBe(false);

      const channel2 = result.current.data[1];
      expect(channel2.name).toBe('Config Channel 2'); // 設定データ
      expect(channel2.description).toBe('Config description for channel 2');
      expect(channel2.videos).toHaveLength(0);
      expect(channel2.hasApiData).toBe(false);

      // エラー情報の確認
      expect(result.current.error.videos).toBeTruthy();
      expect(result.current.error.channels).toBeTruthy();
    });

    it('should handle empty channel list', async () => {
      const { result } = renderHook(() => useYouTubeData([]), {
        wrapper: createWrapper(),
      });

      // データ取得完了まで待機
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // 結果の確認
      expect(result.current.data).toHaveLength(0);
      expect(result.current.error.videos).toBe(null);
      expect(result.current.error.channels).toBe(null);
    });

    it('should handle API key missing scenario', async () => {
      // API キーなしの環境をモック
      Object.defineProperty(import.meta, 'env', {
        value: {
          ...originalEnv,
          VITE_YOUTUBE_API_KEY: undefined,
        },
        writable: true,
      });

      const { result } = renderHook(() => useYouTubeData(mockChannels), {
        wrapper: createWrapper(),
      });

      // データ取得完了まで待機
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // 結果の確認（設定データのみ使用）
      expect(result.current.data).toHaveLength(2);
      expect(result.current.data[0].name).toBe('Config Channel 1');
      expect(result.current.data[0].videos).toHaveLength(0);
      expect(result.current.data[0].hasApiData).toBe(false);

      // API 呼び出しが行われていないことを確認
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Error handling scenarios', () => {
    it('should handle quota exceeded errors', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            error: {
              code: 403,
              message:
                'The request cannot be completed because you have exceeded your quota.',
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            error: {
              code: 403,
              message:
                'The request cannot be completed because you have exceeded your quota.',
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            error: {
              code: 403,
              message:
                'The request cannot be completed because you have exceeded your quota.',
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            error: {
              code: 403,
              message:
                'The request cannot be completed because you have exceeded your quota.',
            },
          }),
        });

      const { result } = renderHook(() => useYouTubeData(mockChannels), {
        wrapper: createWrapper(),
      });

      // データ取得完了まで待機
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // エラーメッセージの確認
      expect(result.current.error.videos).toBeTruthy();
      expect(result.current.error.channels).toBeTruthy();

      // 設定データにフォールバック
      expect(result.current.data).toHaveLength(2);
      expect(result.current.data[0].hasApiData).toBe(false);
      expect(result.current.data[1].hasApiData).toBe(false);
    });

    it('should handle rate limiting with retry', async () => {
      // 最初はレート制限、リトライで成功
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          json: async () => ({
            error: {
              code: 429,
              message: 'Rate limit exceeded',
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockVideoResponse1,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockVideoResponse2,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockChannelResponse1,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockChannelResponse2,
        });

      const { result } = renderHook(() => useYouTubeData(mockChannels), {
        wrapper: createWrapper(),
      });

      // データ取得完了まで待機
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // リトライが成功したことを確認
      expect(result.current.data[0].videos).toHaveLength(1);
      expect(result.current.data[0].hasApiData).toBe(true);
    });
  });
});
