import {
  YouTubeAPIVideoResponse,
  YouTubeAPIChannelResponse,
  YouTubeAPIError,
  YouTubeAPIConfig,
} from '../types/youtube';
import { YouTubeVideo, YouTubeChannel } from '../types';
import { handleApiError } from './errorHandler';

/**
 * YouTube Data API v3 クライアント
 */
export class YouTubeAPIClient {
  private config: YouTubeAPIConfig;
  private baseUrl: string;

  constructor(config: YouTubeAPIConfig) {
    this.config = {
      baseUrl: 'https://www.googleapis.com/youtube/v3',
      maxResults: 5,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
    };
    this.baseUrl = this.config.baseUrl!;
  }

  /**
   * 指定されたチャンネルの最新動画を取得（横長動画のみ）
   * アップロード再生リストを優先的に使用し、フォールバックでsearch APIを使用
   */
  async getLatestVideos(
    channelId: string,
    maxResults = 1
  ): Promise<YouTubeVideo[]> {
    try {
      // まずアップロード再生リストから取得を試行
      const uploadsResult = await this.getLatestVideosFromUploads(
        channelId,
        maxResults
      );
      if (uploadsResult.length > 0) {
        return uploadsResult;
      }
    } catch (error) {
      console.warn(
        'Uploads playlist method failed, falling back to search:',
        error
      );
    }

    // フォールバック: search APIを使用
    return this.getLatestVideosWithSearch(channelId, maxResults);
  }

  /**
   * アップロード再生リストから最新動画を取得
   */
  private async getLatestVideosFromUploads(
    channelId: string,
    maxResults: number
  ): Promise<YouTubeVideo[]> {
    // チャンネル情報を取得してアップロード再生リストIDを取得
    const channelUrl = new URL(`${this.baseUrl}/channels`);
    channelUrl.searchParams.set('key', this.config.apiKey);
    channelUrl.searchParams.set('id', channelId);
    channelUrl.searchParams.set('part', 'contentDetails');

    const channelResponse = await this.fetchWithRetry(channelUrl.toString());
    const channelData = await channelResponse.json();

    if (!channelResponse.ok) {
      throw new Error(`Channel API Error: ${channelData.error.message}`);
    }

    const uploadsPlaylistId =
      channelData.items[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
      throw new Error('No uploads playlist found');
    }

    // アップロード再生リストから動画を取得
    const playlistUrl = new URL(`${this.baseUrl}/playlistItems`);
    playlistUrl.searchParams.set('key', this.config.apiKey);
    playlistUrl.searchParams.set('playlistId', uploadsPlaylistId);
    playlistUrl.searchParams.set('part', 'snippet');
    playlistUrl.searchParams.set(
      'maxResults',
      Math.max(maxResults * 10, 20).toString()
    );

    const playlistResponse = await this.fetchWithRetry(playlistUrl.toString());
    const playlistData = await playlistResponse.json();

    if (!playlistResponse.ok) {
      throw new Error(`Playlist API Error: ${playlistData.error.message}`);
    }

    const videoIds = playlistData.items.map(
      (item: any) => item.snippet.resourceId.videoId
    );

    if (videoIds.length === 0) {
      return [];
    }

    return this.filterAndFormatVideos(videoIds, maxResults);
  }

  /**
   * Search APIを使用した動画取得（フォールバック）
   */
  private async getLatestVideosWithSearch(
    channelId: string,
    maxResults: number
  ): Promise<YouTubeVideo[]> {
    // より多くの動画を取得してフィルタリング
    const searchMaxResults = Math.max(maxResults * 10, 20);

    const url = new URL(`${this.baseUrl}/search`);
    url.searchParams.set('key', this.config.apiKey);
    url.searchParams.set('channelId', channelId);
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('order', 'date');
    url.searchParams.set('type', 'video');
    url.searchParams.set('maxResults', searchMaxResults.toString());
    // ライブストリームを除外（進行中のもののみ）
    // eventType パラメータは削除（アーカイブも除外してしまうため）

    const response = await this.fetchWithRetry(url.toString());
    const data: YouTubeAPIVideoResponse = await response.json();

    if (!response.ok) {
      const error = new Error(
        `YouTube API Error: ${(data as unknown as YouTubeAPIError).error.message}`
      );
      handleApiError(error, `getLatestVideos for channel ${channelId}`);
      throw error;
    }

    // 動画IDを取得してvideos APIで詳細情報を取得
    const videoIds = data.items.map(item => item.id.videoId);
    return this.filterAndFormatVideos(videoIds, maxResults);
  }

  /**
   * 動画をフィルタリングしてフォーマット
   */
  private async filterAndFormatVideos(
    videoIds: string[],
    maxResults: number
  ): Promise<YouTubeVideo[]> {
    if (videoIds.length === 0) {
      return [];
    }

    // videos APIで動画の詳細情報を取得
    const videosUrl = new URL(`${this.baseUrl}/videos`);
    videosUrl.searchParams.set('key', this.config.apiKey);
    videosUrl.searchParams.set('id', videoIds.join(','));
    videosUrl.searchParams.set(
      'part',
      'snippet,contentDetails,status,liveStreamingDetails'
    );

    const videosResponse = await this.fetchWithRetry(videosUrl.toString());
    const videosData = await videosResponse.json();

    if (!videosResponse.ok) {
      throw new Error(`YouTube API Error: ${videosData.error.message}`);
    }

    // 横長動画のみをフィルタリング
    const filteredVideos = videosData.items
      .filter((video: any) => {
        // 公開状態の動画のみ
        if (video.status.privacyStatus !== 'public') {
          return false;
        }

        // ショート動画を除外（60秒以下の動画）
        const duration = video.contentDetails.duration;
        const durationInSeconds = this.parseDuration(duration);
        if (durationInSeconds <= 60) {
          return false;
        }

        // ライブストリーム関連を厳密に除外
        if (
          video.snippet.liveBroadcastContent &&
          video.snippet.liveBroadcastContent !== 'none'
        ) {
          return false;
        }

        // liveStreamingDetails が存在する場合は除外（ライブストリームの証拠）
        if (video.liveStreamingDetails) {
          return false;
        }

        // タイトルにライブ関連のキーワードが含まれている場合は除外
        const title = video.snippet.title.toLowerCase();
        const liveKeywords = [
          'live',
          'ライブ',
          '生放送',
          '配信',
          'stream',
          'streaming',
          'アーカイブ',
          'archive',
          '【live】',
          '【ライブ】',
          '【配信】',
        ];
        if (liveKeywords.some(keyword => title.includes(keyword))) {
          return false;
        }

        // 動画の説明にライブ関連のキーワードが含まれている場合は除外
        const description = (video.snippet.description || '').toLowerCase();
        if (liveKeywords.some(keyword => description.includes(keyword))) {
          return false;
        }

        // 動画の長さが異常に長い場合（6時間以上）はライブストリームの可能性が高いので除外
        if (durationInSeconds > 6 * 60 * 60) {
          return false;
        }

        // カテゴリーIDが Gaming (20) でない場合で、かつ長時間の動画は除外
        // （ゲーム実況の長時間動画は許可するが、他のカテゴリーの長時間動画は疑わしい）
        const categoryId = video.snippet.categoryId;
        if (categoryId !== '20' && durationInSeconds > 3 * 60 * 60) {
          return false;
        }

        return true;
      })
      .slice(0, maxResults) // 必要な数だけ取得
      .map((video: any) => ({
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail:
          video.snippet.thumbnails.medium?.url ||
          video.snippet.thumbnails.default.url,
        publishedAt: video.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${video.id}`,
      }));

    return filteredVideos;
  }

  /**
   * ISO 8601 duration を秒数に変換
   */
  private parseDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);

    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * チャンネル情報を取得
   */
  async getChannelInfo(channelId: string): Promise<YouTubeChannel> {
    const url = new URL(`${this.baseUrl}/channels`);
    url.searchParams.set('key', this.config.apiKey);
    url.searchParams.set('id', channelId);
    url.searchParams.set('part', 'snippet,statistics');

    const response = await this.fetchWithRetry(url.toString());
    const data: YouTubeAPIChannelResponse = await response.json();

    if (!response.ok) {
      const error = new Error(
        `YouTube API Error: ${(data as unknown as YouTubeAPIError).error.message}`
      );
      handleApiError(error, `getChannelInfo for channel ${channelId}`);
      throw error;
    }

    if (data.items.length === 0) {
      const error = new Error(`Channel not found: ${channelId}`);
      handleApiError(error, `getChannelInfo for channel ${channelId}`);
      throw error;
    }

    const channel = data.items[0];
    return {
      id: channel.id,
      name: channel.snippet.title,
      description: channel.snippet.description,
      url: `https://www.youtube.com/channel/${channel.id}`,
      customUrl: channel.snippet.customUrl,
    };
  }

  /**
   * 複数チャンネルの最新動画を一括取得（横長動画のみ）
   */
  async getLatestVideosForChannels(
    channelIds: string[]
  ): Promise<Record<string, YouTubeVideo[]>> {
    const results: Record<string, YouTubeVideo[]> = {};

    // 並列実行でパフォーマンス向上
    const promises = channelIds.map(async channelId => {
      try {
        const videos = await this.getLatestVideos(channelId, 1);
        return { channelId, videos };
      } catch (error) {
        handleApiError(
          error,
          `getLatestVideosForChannels for channel ${channelId}`
        );
        return { channelId, videos: [] };
      }
    });

    const responses = await Promise.allSettled(promises);

    responses.forEach(response => {
      if (response.status === 'fulfilled') {
        results[response.value.channelId] = response.value.videos;
      }
    });

    return results;
  }

  /**
   * リトライ機能付きfetch
   */
  private async fetchWithRetry(url: string, attempt = 1): Promise<Response> {
    try {
      const response = await fetch(url);

      // レート制限やサーバーエラーの場合はリトライ
      if (response.status === 429 || response.status >= 500) {
        if (attempt < this.config.retryAttempts!) {
          await this.delay(this.config.retryDelay! * attempt);
          return this.fetchWithRetry(url, attempt + 1);
        }
      }

      return response;
    } catch (error) {
      if (attempt < this.config.retryAttempts!) {
        await this.delay(this.config.retryDelay! * attempt);
        return this.fetchWithRetry(url, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * 遅延ユーティリティ
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * デフォルトのYouTube APIクライアントインスタンスを作成
 */
export const createYouTubeClient = (): YouTubeAPIClient | null => {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  if (!apiKey) {
    console.warn(
      'YouTube API key not found. YouTube features will be disabled.'
    );
    return null;
  }

  return new YouTubeAPIClient({
    apiKey,
    maxResults: 5,
    retryAttempts: 3,
    retryDelay: 1000,
  });
};

/**
 * YouTube APIエラーかどうかを判定
 */
export const isYouTubeAPIError = (error: any): error is YouTubeAPIError => {
  return error && error.error && typeof error.error.code === 'number';
};

/**
 * YouTube APIエラーメッセージを取得
 */
export const getYouTubeErrorMessage = (error: any): string => {
  if (isYouTubeAPIError(error)) {
    return error.error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown YouTube API error occurred';
};
