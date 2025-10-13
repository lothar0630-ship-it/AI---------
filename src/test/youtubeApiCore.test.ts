import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  YouTubeAPIClient,
  getYouTubeErrorMessage,
  isYouTubeAPIError,
} from '../utils/youtubeApi';

// fetch のモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockSuccessResponse = {
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

describe('YouTubeAPIClient Core Functionality', () => {
  let client: YouTubeAPIClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
    client = new YouTubeAPIClient({
      apiKey: 'test-api-key',
      retryAttempts: 1, // テスト用に短縮
    });
  });

  describe('getLatestVideos', () => {
    it('should fetch and transform video data correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse,
      });

      const result = await client.getLatestVideos('test-channel-id', 1);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'test-video-id',
        title: 'Test Video Title',
        description: 'Test video description',
        thumbnail: 'https://example.com/thumbnail.jpg',
        publishedAt: '2024-01-01T00:00:00Z',
        url: 'https://www.youtube.com/watch?v=test-video-id',
      });

      // API呼び出しの確認
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://www.googleapis.com/youtube/v3/search')
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: {
            code: 403,
            message:
              'The request cannot be completed because you have exceeded your quota.',
          },
        }),
      });

      await expect(
        client.getLatestVideos('test-channel-id', 1)
      ).rejects.toThrow(
        'YouTube API Error: The request cannot be completed because you have exceeded your quota.'
      );
    });

    it('should handle empty results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      });

      const result = await client.getLatestVideos('test-channel-id', 1);
      expect(result).toHaveLength(0);
    });

    it('should use default thumbnail when medium is not available', async () => {
      const responseWithDefaultOnly = {
        items: [
          {
            id: { videoId: 'test-video-id' },
            snippet: {
              title: 'Test Video Title',
              description: 'Test video description',
              publishedAt: '2024-01-01T00:00:00Z',
              thumbnails: {
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithDefaultOnly,
      });

      const result = await client.getLatestVideos('test-channel-id', 1);
      expect(result[0].thumbnail).toBe(
        'https://example.com/thumbnail-default.jpg'
      );
    });

    it('should handle custom maxResults parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse,
      });

      await client.getLatestVideos('test-channel-id', 5);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('maxResults=5')
      );
    });
  });

  describe('getChannelInfo', () => {
    it('should fetch and transform channel data correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockChannelResponse,
      });

      const result = await client.getChannelInfo('test-channel-id');

      expect(result).toEqual({
        id: 'test-channel-id',
        name: 'Test Channel',
        description: 'Test channel description',
        url: 'https://www.youtube.com/channel/test-channel-id',
        customUrl: '@testchannel',
      });
    });

    it('should handle channel not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      });

      await expect(
        client.getChannelInfo('nonexistent-channel')
      ).rejects.toThrow('Channel not found: nonexistent-channel');
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: {
            code: 404,
            message: 'Channel not found',
          },
        }),
      });

      await expect(client.getChannelInfo('test-channel-id')).rejects.toThrow(
        'YouTube API Error: Channel not found'
      );
    });
  });

  describe('getLatestVideosForChannels', () => {
    it('should fetch videos for multiple channels', async () => {
      // 複数の成功レスポンスをモック
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSuccessResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            items: [
              {
                id: { videoId: 'test-video-id-2' },
                snippet: {
                  title: 'Test Video Title 2',
                  description: 'Test video description 2',
                  publishedAt: '2024-01-02T00:00:00Z',
                  thumbnails: {
                    medium: {
                      url: 'https://example.com/thumbnail2.jpg',
                      width: 320,
                      height: 180,
                    },
                    default: {
                      url: 'https://example.com/thumbnail2-default.jpg',
                      width: 120,
                      height: 90,
                    },
                  },
                },
              },
            ],
          }),
        });

      const result = await client.getLatestVideosForChannels([
        'channel1',
        'channel2',
      ]);

      expect(Object.keys(result)).toHaveLength(2);
      expect(result['channel1']).toHaveLength(1);
      expect(result['channel2']).toHaveLength(1);
      expect(result['channel1'][0].id).toBe('test-video-id');
      expect(result['channel2'][0].id).toBe('test-video-id-2');
    });

    it('should handle partial failures gracefully', async () => {
      // 1つ成功、1つ失敗のレスポンスをモック
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSuccessResponse,
        })
        .mockRejectedValueOnce(new Error('Network error'));

      const result = await client.getLatestVideosForChannels([
        'channel1',
        'channel2',
      ]);

      expect(Object.keys(result)).toHaveLength(2);
      expect(result['channel1']).toHaveLength(1);
      expect(result['channel2']).toHaveLength(0); // エラーの場合は空配列
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        client.getLatestVideos('test-channel-id', 1)
      ).rejects.toThrow('Network error');
    });

    it('should handle 403 errors without retry', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          error: {
            code: 403,
            message: 'Forbidden',
          },
        }),
      });

      await expect(
        client.getLatestVideos('test-channel-id', 1)
      ).rejects.toThrow('YouTube API Error: Forbidden');

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle 404 errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          error: {
            code: 404,
            message: 'Not found',
          },
        }),
      });

      await expect(
        client.getLatestVideos('test-channel-id', 1)
      ).rejects.toThrow('YouTube API Error: Not found');
    });
  });
});

describe('YouTube API Utility Functions', () => {
  describe('getYouTubeErrorMessage', () => {
    it('should extract message from YouTube API error', () => {
      const error = {
        error: {
          code: 403,
          message: 'Quota exceeded',
        },
      };

      expect(getYouTubeErrorMessage(error)).toBe('Quota exceeded');
    });

    it('should handle regular Error objects', () => {
      const error = new Error('Network error');
      expect(getYouTubeErrorMessage(error)).toBe('Network error');
    });

    it('should handle unknown errors', () => {
      expect(getYouTubeErrorMessage('unknown')).toBe(
        'Unknown YouTube API error occurred'
      );
    });
  });

  describe('isYouTubeAPIError', () => {
    it('should identify YouTube API errors correctly', () => {
      const youtubeError = {
        error: {
          code: 403,
          message: 'Quota exceeded',
        },
      };

      expect(isYouTubeAPIError(youtubeError)).toBe(true);
    });

    it('should return false for non-YouTube API errors', () => {
      const regularError = new Error('Network error');
      expect(isYouTubeAPIError(regularError)).toBeFalsy();
    });

    it('should return false for invalid objects', () => {
      expect(isYouTubeAPIError(null)).toBeFalsy();
      expect(isYouTubeAPIError(undefined)).toBeFalsy();
      expect(isYouTubeAPIError('string')).toBeFalsy();
    });
  });
});
