// YouTube Data API v3 レスポンス型定義

export interface YouTubeAPIVideoResponse {
  kind: string;
  etag: string;
  items: YouTubeAPIVideoItem[];
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

export interface YouTubeAPIVideoItem {
  kind: string;
  etag: string;
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: YouTubeThumbnail;
      medium: YouTubeThumbnail;
      high: YouTubeThumbnail;
    };
    channelTitle: string;
    liveBroadcastContent: string;
    publishTime: string;
  };
}

export interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface YouTubeAPIChannelResponse {
  kind: string;
  etag: string;
  items: YouTubeAPIChannelItem[];
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

export interface YouTubeAPIChannelItem {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    title: string;
    description: string;
    customUrl?: string;
    publishedAt: string;
    thumbnails: {
      default: YouTubeThumbnail;
      medium: YouTubeThumbnail;
      high: YouTubeThumbnail;
    };
    country?: string;
  };
  statistics: {
    viewCount: string;
    subscriberCount: string;
    hiddenSubscriberCount: boolean;
    videoCount: string;
  };
}

// エラー型定義
export interface YouTubeAPIError {
  error: {
    code: number;
    message: string;
    errors: Array<{
      message: string;
      domain: string;
      reason: string;
    }>;
  };
}

// API クライアント設定型
export interface YouTubeAPIConfig {
  apiKey: string;
  baseUrl?: string;
  maxResults?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

// フック用の状態型
export interface YouTubeVideosState {
  videos: Record<string, any[]>; // channelId -> videos mapping
  loading: boolean;
  error: string | null;
  lastFetch: Record<string, number>; // channelId -> timestamp mapping
}

export interface YouTubeChannelState {
  channels: Record<string, any>; // channelId -> channel info mapping
  loading: boolean;
  error: string | null;
  lastFetch: Record<string, number>; // channelId -> timestamp mapping
}
