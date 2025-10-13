import { useQuery, useQueries } from '@tanstack/react-query';
import { YouTubeVideo, YouTubeChannel } from '../types';
import {
  createYouTubeClient,
  getYouTubeErrorMessage,
} from '../utils/youtubeApi';
import { apiCache } from '../utils/cacheManager';

// キャッシュ時間の設定（10分）
const CACHE_TIME = 10 * 60 * 1000;
const STALE_TIME = 5 * 60 * 1000;

/**
 * 単一チャンネルの最新動画を取得するフック
 */
export const useYouTubeVideos = (channelId: string, maxResults = 1) => {
  const client = createYouTubeClient();

  return useQuery({
    queryKey: ['youtube-videos', channelId, maxResults],
    queryFn: async (): Promise<YouTubeVideo[]> => {
      if (!client) {
        throw new Error('YouTube API client is not available');
      }

      // キャッシュから取得を試行
      const cacheKey = `videos_${channelId}_${maxResults}`;
      const cached = apiCache.get<YouTubeVideo[]>(cacheKey);
      if (cached) {
        return cached;
      }

      // API から取得してキャッシュに保存
      const videos = await client.getLatestVideos(channelId, maxResults);
      apiCache.set(cacheKey, videos, CACHE_TIME);
      return videos;
    },
    enabled: !!client && !!channelId,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: (failureCount, error) => {
      // API制限エラーの場合はリトライしない
      if (error instanceof Error && error.message.includes('quotaExceeded')) {
        return false;
      }
      // 最大3回までリトライ
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * 複数チャンネルの最新動画を取得するフック
 */
export const useMultipleYouTubeVideos = (
  channelIds: string[],
  maxResults = 1
) => {
  const client = createYouTubeClient();

  const queries = useQueries({
    queries: channelIds.map(channelId => ({
      queryKey: ['youtube-videos', channelId, maxResults],
      queryFn: async (): Promise<YouTubeVideo[]> => {
        if (!client) {
          throw new Error('YouTube API client is not available');
        }
        return client.getLatestVideos(channelId, maxResults);
      },
      enabled: !!client && !!channelId,
      staleTime: STALE_TIME,
      gcTime: CACHE_TIME,
      retry: (failureCount: number, error: Error) => {
        if (error.message.includes('quotaExceeded')) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex: number) =>
        Math.min(1000 * 2 ** attemptIndex, 30000),
    })),
  });

  // 結果を整理して返す
  const videosMap: Record<string, YouTubeVideo[]> = {};
  const errors: Record<string, string> = {};
  let isLoading = false;
  let hasError = false;

  queries.forEach((query, index) => {
    const channelId = channelIds[index];

    if (query.isLoading) {
      isLoading = true;
    }

    if (query.error) {
      hasError = true;
      errors[channelId] = getYouTubeErrorMessage(query.error);
      videosMap[channelId] = [];
    } else if (query.data) {
      videosMap[channelId] = query.data;
    } else {
      videosMap[channelId] = [];
    }
  });

  return {
    data: videosMap,
    isLoading,
    error: hasError ? errors : null,
    queries, // 個別のクエリ結果にもアクセス可能
  };
};

/**
 * チャンネル情報を取得するフック
 */
export const useYouTubeChannel = (channelId: string) => {
  const client = createYouTubeClient();

  return useQuery({
    queryKey: ['youtube-channel', channelId],
    queryFn: async (): Promise<YouTubeChannel> => {
      if (!client) {
        throw new Error('YouTube API client is not available');
      }
      return client.getChannelInfo(channelId);
    },
    enabled: !!client && !!channelId,
    staleTime: CACHE_TIME, // チャンネル情報は変更頻度が低いので長めに設定
    gcTime: CACHE_TIME * 2,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('quotaExceeded')) {
        return false;
      }
      return failureCount < 2; // チャンネル情報は少なめのリトライ
    },
  });
};

/**
 * 複数チャンネルの情報を取得するフック
 */
export const useMultipleYouTubeChannels = (channelIds: string[]) => {
  const client = createYouTubeClient();

  const queries = useQueries({
    queries: channelIds.map(channelId => ({
      queryKey: ['youtube-channel', channelId],
      queryFn: async (): Promise<YouTubeChannel> => {
        if (!client) {
          throw new Error('YouTube API client is not available');
        }
        return client.getChannelInfo(channelId);
      },
      enabled: !!client && !!channelId,
      staleTime: CACHE_TIME,
      gcTime: CACHE_TIME * 2,
      retry: (failureCount: number, error: Error) => {
        if (error.message.includes('quotaExceeded')) {
          return false;
        }
        return failureCount < 2;
      },
    })),
  });

  // 結果を整理して返す
  const channelsMap: Record<string, YouTubeChannel> = {};
  const errors: Record<string, string> = {};
  let isLoading = false;
  let hasError = false;

  queries.forEach((query, index) => {
    const channelId = channelIds[index];

    if (query.isLoading) {
      isLoading = true;
    }

    if (query.error) {
      hasError = true;
      errors[channelId] = getYouTubeErrorMessage(query.error);
    } else if (query.data) {
      channelsMap[channelId] = query.data;
    }
  });

  return {
    data: channelsMap,
    isLoading,
    error: hasError ? errors : null,
    queries,
  };
};

/**
 * YouTube API の利用可能性をチェックするフック
 */
export const useYouTubeAvailability = () => {
  const client = createYouTubeClient();

  return {
    isAvailable: !!client,
    hasApiKey: !!import.meta.env.VITE_YOUTUBE_API_KEY,
  };
};

/**
 * 設定ファイルからのチャンネル情報と最新動画を統合して取得するフック
 */
export const useYouTubeData = (channels: YouTubeChannel[]) => {
  const channelIds = channels.map(channel => channel.id);

  const videosResult = useMultipleYouTubeVideos(channelIds, 1);
  const channelsResult = useMultipleYouTubeChannels(channelIds);

  // 設定ファイルの情報とAPI情報をマージ
  const mergedData = channels.map(configChannel => {
    const apiChannel = channelsResult.data[configChannel.id];
    const videos = videosResult.data[configChannel.id] || [];

    return {
      ...configChannel,
      // 設定ファイルの説明文を優先し、名前のみAPIから取得
      ...(apiChannel && {
        name: apiChannel.name,
      }),
      // 設定ファイルの説明文を保持
      description: configChannel.description,
      videos,
      hasApiData: !!apiChannel,
    };
  });

  return {
    data: mergedData,
    isLoading: videosResult.isLoading || channelsResult.isLoading,
    error: {
      videos: videosResult.error,
      channels: channelsResult.error,
    },
    videosQueries: videosResult.queries,
    channelsQueries: channelsResult.queries,
  };
};
