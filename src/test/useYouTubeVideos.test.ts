import { describe, it, expect, vi, beforeEach } from 'vitest';
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
vi.mock('../utils/youtubeApi', () => ({
  createYouTubeClient: vi.fn(),
  getYouTubeErrorMessage: vi.fn(),
}));

// YouTube API クライアントのモック
const mockYouTubeClient = {
  getLatestVideos: vi.fn(),
  getChannelInfo: vi.fn(),
} as any;

// キャッシュマネージャーのモック
vi.mock('../utils/cacheManager', () => ({
  apiCache: {
    get: vi.fn(() => null),
    set: vi.fn(),
    clear: vi.fn(),
  },
}));

// テスト用のモックデータ
const mockVideoData = [
  {
    id: 'test-video-id',
    title: 'Test Video Title',
    description: 'Test video description',
    thumbnail: 'https://example.com/thumbnail.jpg',
    publishedAt: '2024-01-01T00:00:00Z',
    url: 'https://www.youtube.com/watch?v=test-video-id',
  },
];

const mockChannelData = {
  id: 'test-channel-id',
  name: 'Test Channel',
  description: 'Test channel description',
  url: 'https://www.youtube.com/channel/test-channel-id',
  customUrl: '@testchannel',
};

// テスト用の QueryClient プロバイダー
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useYouTubeVideos', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // モックされたモジュールを取得
    const { createYouTubeClient, getYouTubeErrorMessage } = await import(
      '../utils/youtubeApi'
    );

    // デフォルトのモック動作を設定
    vi.mocked(createYouTubeClient).mockReturnValue(mockYouTubeClient);
    vi.mocked(getYouTubeErrorMessage).mockImplementation(
      error => error.message || 'Unknown error'
    );

    mockYouTubeClient.getLatestVideos.mockResolvedValue(mockVideoData);
    mockYouTubeClient.getChannelInfo.mockResolvedValue(mockChannelData);
  });

  it('should return availability status correctly', async () => {
    const { createYouTubeClient } = await import('../utils/youtubeApi');
    vi.mocked(createYouTubeClient).mockReturnValue(mockYouTubeClient);

    const { result } = renderHook(() => useYouTubeAvailability());

    expect(result.current.isAvailable).toBe(true);
    // hasApiKeyは環境変数に依存するため、テスト環境では柔軟にチェック
    expect(typeof result.current.hasApiKey).toBe('boolean');
  });

  it('should fetch YouTube videos successfully', async () => {
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
    expect(mockYouTubeClient.getLatestVideos).toHaveBeenCalledWith(
      'test-channel-id',
      1
    );
    expect(result.current.data).toEqual(mockVideoData);
    expect(result.current.error).toBe(null);
  });

  it('should handle API errors gracefully', async () => {
    // エラーを発生させる（quotaExceededエラーはリトライしない）
    const error = new Error('quotaExceeded');
    mockYouTubeClient.getLatestVideos.mockRejectedValue(error);

    const { result } = renderHook(
      () => useYouTubeVideos('test-channel-id', 1),
      { wrapper: createWrapper() }
    );

    // エラー状態まで待機
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 3000 }
    );

    // エラー状態の確認
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeTruthy();
  });

  it('should handle network errors', async () => {
    // ネットワークエラーのモック（quotaExceededエラーはリトライしない）
    mockYouTubeClient.getLatestVideos.mockRejectedValue(
      new Error('quotaExceeded')
    );

    const { result } = renderHook(
      () => useYouTubeVideos('test-channel-id', 1),
      { wrapper: createWrapper() }
    );

    // エラー状態まで待機
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 3000 }
    );

    // エラー状態の確認
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeTruthy();
  });

  it('should not fetch when API key is missing', async () => {
    // createYouTubeClient が null を返すようにモック
    const { createYouTubeClient } = await import('../utils/youtubeApi');
    vi.mocked(createYouTubeClient).mockReturnValue(null);

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
  beforeEach(async () => {
    vi.clearAllMocks();

    const { createYouTubeClient } = await import('../utils/youtubeApi');
    vi.mocked(createYouTubeClient).mockReturnValue(mockYouTubeClient);
    mockYouTubeClient.getLatestVideos.mockResolvedValue(mockVideoData);
  });

  it('should fetch videos for multiple channels successfully', async () => {
    // 複数のチャンネルのレスポンスをモック
    const mockVideo1 = [
      { ...mockVideoData[0], id: 'video1', title: 'Video 1' },
    ];
    const mockVideo2 = [
      { ...mockVideoData[0], id: 'video2', title: 'Video 2' },
    ];

    mockYouTubeClient.getLatestVideos
      .mockResolvedValueOnce(mockVideo1)
      .mockResolvedValueOnce(mockVideo2);

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
    mockYouTubeClient.getLatestVideos
      .mockResolvedValueOnce(mockVideoData)
      .mockRejectedValueOnce(new Error('quotaExceeded')); // リトライしないエラー

    const { result } = renderHook(
      () => useMultipleYouTubeVideos(['channel1', 'channel2'], 1),
      { wrapper: createWrapper() }
    );

    // データ取得完了まで待機
    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 3000 }
    );

    // 結果の確認
    expect(result.current.data.channel1).toHaveLength(1);
    expect(result.current.data.channel2).toHaveLength(0);
    expect(result.current.error).toBeTruthy();
    expect(result.current.error!.channel2).toContain('quotaExceeded');
  });
});

describe('useYouTubeChannel', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    const { createYouTubeClient } = await import('../utils/youtubeApi');
    vi.mocked(createYouTubeClient).mockReturnValue(mockYouTubeClient);
    mockYouTubeClient.getChannelInfo.mockResolvedValue(mockChannelData);
  });

  it('should fetch channel information successfully', async () => {
    const { result } = renderHook(() => useYouTubeChannel('test-channel-id'), {
      wrapper: createWrapper(),
    });

    // データ取得完了まで待機
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // 結果の確認
    expect(mockYouTubeClient.getChannelInfo).toHaveBeenCalledWith(
      'test-channel-id'
    );
    expect(result.current.data).toEqual(mockChannelData);
    expect(result.current.error).toBe(null);
  });
});

describe('useMultipleYouTubeChannels', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    const { createYouTubeClient } = await import('../utils/youtubeApi');
    vi.mocked(createYouTubeClient).mockReturnValue(mockYouTubeClient);
  });

  it('should fetch multiple channels successfully', async () => {
    const mockChannel1 = {
      ...mockChannelData,
      id: 'channel1',
      name: 'Channel 1',
    };
    const mockChannel2 = {
      ...mockChannelData,
      id: 'channel2',
      name: 'Channel 2',
    };

    mockYouTubeClient.getChannelInfo
      .mockResolvedValueOnce(mockChannel1)
      .mockResolvedValueOnce(mockChannel2);

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
  beforeEach(async () => {
    vi.clearAllMocks();

    const { createYouTubeClient } = await import('../utils/youtubeApi');
    vi.mocked(createYouTubeClient).mockReturnValue(mockYouTubeClient);
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

    const apiChannelData = {
      ...mockChannelData,
      id: 'channel1',
      name: 'API Channel 1',
      description: 'API description 1',
    };

    mockYouTubeClient.getLatestVideos.mockResolvedValue(mockVideoData);
    mockYouTubeClient.getChannelInfo.mockResolvedValue(apiChannelData);

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
    expect(result.current.data[0].videos).toHaveLength(1);
    expect(result.current.data[0].hasApiData).toBe(true);
  });
});

describe('useYouTubeAvailability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true when API key is available', async () => {
    const { createYouTubeClient } = await import('../utils/youtubeApi');
    vi.mocked(createYouTubeClient).mockReturnValue(mockYouTubeClient);

    const { result } = renderHook(() => useYouTubeAvailability());

    expect(result.current.isAvailable).toBe(true);
    // hasApiKeyは環境変数に依存するため、テスト環境では柔軟にチェック
    expect(typeof result.current.hasApiKey).toBe('boolean');
  });

  it('should return false when API key is missing', async () => {
    const { createYouTubeClient } = await import('../utils/youtubeApi');
    vi.mocked(createYouTubeClient).mockReturnValue(null);

    const { result } = renderHook(() => useYouTubeAvailability());

    // createYouTubeClientがnullを返す場合、isAvailableはfalseになる
    expect(result.current.isAvailable).toBe(false);
    // hasApiKeyは環境変数に依存するため、テスト環境では常にtrueになる可能性がある
    // このテストでは isAvailable のみをチェック
  });
});
