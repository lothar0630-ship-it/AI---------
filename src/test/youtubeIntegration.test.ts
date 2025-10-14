import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useYouTubeData } from '../hooks/useYouTubeVideos';
import { YouTubeChannel, YouTubeVideo } from '../types';
import * as youtubeApi from '../utils/youtubeApi';

// YouTube API クライアントをモック
vi.mock('../utils/youtubeApi', async () => {
  const actual = await vi.importActual('../utils/youtubeApi');
  return {
    ...actual,
    createYouTubeClient: vi.fn(),
  };
});

// テスト用の QueryClient プロバイダー
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
        retryDelay: 0,
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

// モック動画データ
const mockVideo1: YouTubeVideo = {
  id: 'video123',
  title: 'Latest Video from Channel 1',
  description: 'Description of latest video from channel 1',
  thumbnail: 'https://img.youtube.com/vi/video123/mqdefault.jpg',
  publishedAt: '2024-01-15T10:00:00Z',
  url: 'https://www.youtube.com/watch?v=video123',
};

const mockVideo2: YouTubeVideo = {
  id: 'video456',
  title: 'Latest Video from Channel 2',
  description: 'Description of latest video from channel 2',
  thumbnail: 'https://img.youtube.com/vi/video456/mqdefault.jpg',
  publishedAt: '2024-01-14T15:30:00Z',
  url: 'https://www.youtube.com/watch?v=video456',
};

// モックチャンネルデータ
const mockApiChannel1: YouTubeChannel = {
  id: 'UC123456789',
  name: 'API Channel 1',
  description: 'Updated description from API for channel 1',
  url: 'https://www.youtube.com/channel/UC123456789',
  customUrl: '@apichannel1',
};

const mockApiChannel2: YouTubeChannel = {
  id: 'UC987654321',
  name: 'API Channel 2',
  description: 'Updated description from API for channel 2',
  url: 'https://www.youtube.com/channel/UC987654321',
  customUrl: '@apichannel2',
};

// モック YouTube API クライアント
const createMockClient = (options: {
  shouldSucceed?: boolean;
  videos?: Record<string, YouTubeVideo[]>;
  channels?: Record<string, YouTubeChannel>;
  shouldThrow?: boolean;
  videoErrors?: Record<string, Error>;
  channelErrors?: Record<string, Error>;
}) => {
  const {
    shouldSucceed = true,
    videos = {},
    channels = {},
    shouldThrow = false,
    videoErrors = {},
    channelErrors = {},
  } = options;

  return {
    getLatestVideos: vi.fn().mockImplementation(async (channelId: string) => {
      if (shouldThrow) {
        throw new Error('Network error');
      }
      if (videoErrors[channelId]) {
        throw videoErrors[channelId];
      }
      if (!shouldSucceed) {
        throw new Error('API Error: Quota exceeded');
      }
      return videos[channelId] || [];
    }),
    getChannelInfo: vi.fn().mockImplementation(async (channelId: string) => {
      if (shouldThrow) {
        throw new Error('Network error');
      }
      if (channelErrors[channelId]) {
        throw channelErrors[channelId];
      }
      if (!shouldSucceed) {
        throw new Error('API Error: Channel not found');
      }
      const channel = channels[channelId];
      if (!channel) {
        throw new Error('Channel not found');
      }
      return channel;
    }),
  };
};

describe('YouTube API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useYouTubeData integration', () => {
    it('should successfully integrate config data with API data', async () => {
      // 成功するモッククライアントを設定
      const mockClient = createMockClient({
        videos: {
          UC123456789: [mockVideo1],
          UC987654321: [mockVideo2],
        },
        channels: {
          UC123456789: mockApiChannel1,
          UC987654321: mockApiChannel2,
        },
      });

      vi.mocked(youtubeApi.createYouTubeClient).mockReturnValue(
        mockClient as any
      );

      const { result } = renderHook(() => useYouTubeData(mockChannels), {
        wrapper: createWrapper(),
      });

      // データ取得完了まで待機
      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000 }
      );

      // 統合結果の確認
      expect(result.current.data).toHaveLength(2);

      // 1つ目のチャンネル
      const channel1 = result.current.data[0];
      expect(channel1.id).toBe('UC123456789');
      expect(channel1.name).toBe('API Channel 1'); // API データで上書き
      expect(channel1.description).toBe('Config description for channel 1'); // 設定データを保持
      expect(channel1.videos).toHaveLength(1);
      expect(channel1.videos[0].id).toBe('video123');
      expect(channel1.videos[0].title).toBe('Latest Video from Channel 1');
      expect(channel1.hasApiData).toBe(true);

      // 2つ目のチャンネル
      const channel2 = result.current.data[1];
      expect(channel2.id).toBe('UC987654321');
      expect(channel2.name).toBe('API Channel 2'); // API データで上書き
      expect(channel2.description).toBe('Config description for channel 2'); // 設定データを保持
      expect(channel2.videos).toHaveLength(1);
      expect(channel2.videos[0].id).toBe('video456');
      expect(channel2.videos[0].title).toBe('Latest Video from Channel 2');
      expect(channel2.hasApiData).toBe(true);

      // エラーがないことを確認
      expect(result.current.error.videos).toBe(null);
      expect(result.current.error.channels).toBe(null);
    });

    it('should handle API failures gracefully and fallback to config data', async () => {
      // 部分的に失敗するモッククライアントを設定
      const mockClient = createMockClient({
        videos: {
          UC123456789: [mockVideo1],
        },
        channels: {
          UC123456789: mockApiChannel1,
        },
        videoErrors: {
          UC987654321: new Error('Quota exceeded'),
        },
        channelErrors: {
          UC987654321: new Error('Channel not found'),
        },
      });

      vi.mocked(youtubeApi.createYouTubeClient).mockReturnValue(
        mockClient as any
      );

      const { result } = renderHook(() => useYouTubeData(mockChannels), {
        wrapper: createWrapper(),
      });

      // データ取得完了まで待機
      await waitFor(
        () => {
          expect(result.current.data).toHaveLength(2);
          // 2つ目のチャンネルが設定データにフォールバックしていることを確認
          expect(result.current.data[1].hasApiData).toBe(false);
        },
        { timeout: 3000 }
      );

      // 結果の確認
      expect(result.current.data).toHaveLength(2);

      // 1つ目のチャンネル（成功）
      const channel1 = result.current.data[0];
      // チャンネル情報が取得できた場合はAPI名、失敗した場合は設定名
      if (channel1.hasApiData) {
        expect(channel1.name).toBe('API Channel 1'); // API データ
        expect(channel1.videos).toHaveLength(1);
      } else {
        expect(channel1.name).toBe('Config Channel 1'); // 設定データ
        expect(channel1.videos).toHaveLength(0);
      }

      // 2つ目のチャンネル（失敗、設定データにフォールバック）
      const channel2 = result.current.data[1];
      expect(channel2.name).toBe('Config Channel 2'); // 設定データ
      expect(channel2.videos).toHaveLength(0); // 動画取得失敗
      expect(channel2.hasApiData).toBe(false);
    });

    it('should handle complete API failure and use only config data', async () => {
      // 全て失敗するモッククライアントを設定
      const mockClient = createMockClient({
        shouldThrow: true,
      });

      vi.mocked(youtubeApi.createYouTubeClient).mockReturnValue(
        mockClient as any
      );

      const { result } = renderHook(() => useYouTubeData(mockChannels), {
        wrapper: createWrapper(),
      });

      // データ取得完了まで待機
      await waitFor(
        () => {
          expect(result.current.data).toHaveLength(2);
          // 両方のチャンネルが設定データにフォールバックしていることを確認
          expect(result.current.data[0].hasApiData).toBe(false);
          expect(result.current.data[1].hasApiData).toBe(false);
        },
        { timeout: 3000 }
      );

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
    });

    it('should handle empty channel list', async () => {
      const mockClient = createMockClient({});
      vi.mocked(youtubeApi.createYouTubeClient).mockReturnValue(
        mockClient as any
      );

      const { result } = renderHook(() => useYouTubeData([]), {
        wrapper: createWrapper(),
      });

      // データ取得完了まで待機
      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000 }
      );

      // 結果の確認
      expect(result.current.data).toHaveLength(0);
      expect(result.current.error.videos).toBe(null);
      expect(result.current.error.channels).toBe(null);
    });

    it('should handle API key missing scenario', async () => {
      // API キーがない場合はクライアントがnullを返す
      vi.mocked(youtubeApi.createYouTubeClient).mockReturnValue(null);

      const { result } = renderHook(() => useYouTubeData(mockChannels), {
        wrapper: createWrapper(),
      });

      // データ取得完了まで待機
      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 3000 }
      );

      // 結果の確認（設定データのみ使用）
      expect(result.current.data).toHaveLength(2);
      expect(result.current.data[0].name).toBe('Config Channel 1');
      expect(result.current.data[0].videos).toHaveLength(0);
      expect(result.current.data[0].hasApiData).toBe(false);
    });
  });

  describe('Error handling scenarios', () => {
    it('should handle quota exceeded errors', async () => {
      const mockClient = createMockClient({
        shouldSucceed: false,
      });

      vi.mocked(youtubeApi.createYouTubeClient).mockReturnValue(
        mockClient as any
      );

      const { result } = renderHook(() => useYouTubeData(mockChannels), {
        wrapper: createWrapper(),
      });

      // データ取得完了まで待機
      await waitFor(
        () => {
          expect(result.current.data).toHaveLength(2);
          // 両方のチャンネルが設定データにフォールバックしていることを確認
          expect(result.current.data[0].hasApiData).toBe(false);
          expect(result.current.data[1].hasApiData).toBe(false);
        },
        { timeout: 3000 }
      );

      // 設定データにフォールバック
      expect(result.current.data).toHaveLength(2);
      expect(result.current.data[0].hasApiData).toBe(false);
      expect(result.current.data[1].hasApiData).toBe(false);
    });

    it('should handle rate limiting with retry', async () => {
      // 最初は失敗、その後成功するクライアント
      let callCount = 0;
      const mockClient = {
        getLatestVideos: vi
          .fn()
          .mockImplementation(async (channelId: string) => {
            callCount++;
            if (callCount <= 2) {
              throw new Error('Rate limit exceeded');
            }
            return channelId === 'UC123456789' ? [mockVideo1] : [mockVideo2];
          }),
        getChannelInfo: vi
          .fn()
          .mockImplementation(async (channelId: string) => {
            return channelId === 'UC123456789'
              ? mockApiChannel1
              : mockApiChannel2;
          }),
      };

      vi.mocked(youtubeApi.createYouTubeClient).mockReturnValue(
        mockClient as any
      );

      const { result } = renderHook(() => useYouTubeData(mockChannels), {
        wrapper: createWrapper(),
      });

      // データ取得完了まで待機
      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false);
        },
        { timeout: 5000 }
      );

      // リトライが成功したことを確認
      expect(result.current.data[0].videos).toHaveLength(1);
      expect(result.current.data[0].hasApiData).toBe(true);
    });
  });
});
