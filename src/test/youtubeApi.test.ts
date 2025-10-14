import { describe, it, expect, vi, beforeEach } from 'vitest';
import { YouTubeAPIClient, getYouTubeErrorMessage } from '../utils/youtubeApi';

// fetch のモック
global.fetch = vi.fn();

// チャンネルのアップロード情報レスポンス（uploads playlist用）
const mockChannelUploadsResponse = {
  items: [
    {
      contentDetails: {
        relatedPlaylists: {
          uploads: 'UU123456789',
        },
      },
    },
  ],
};

// プレイリストアイテムレスポンス
const mockPlaylistResponse = {
  items: [
    {
      snippet: {
        resourceId: {
          videoId: 'test-video-id',
        },
      },
    },
  ],
};

// 動画詳細レスポンス
const mockVideosResponse = {
  items: [
    {
      id: 'test-video-id',
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
      contentDetails: {
        duration: 'PT5M30S',
      },
      status: {
        privacyStatus: 'public',
      },
    },
  ],
};

// Search APIレスポンス（フォールバック用）
const mockSearchResponse = {
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

describe('YouTubeAPIClient', () => {
  let client: YouTubeAPIClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new YouTubeAPIClient({
      apiKey: 'test-api-key',
      retryAttempts: 1, // テスト用に短縮
    });
  });

  describe('getLatestVideos', () => {
    it('should fetch and transform video data correctly using uploads playlist', async () => {
      // アップロード再生リストを使用した成功パターン
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockChannelUploadsResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlaylistResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockVideosResponse,
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

      // 3回のAPI呼び出しが行われることを確認
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should fallback to search API when uploads playlist fails', async () => {
      // アップロード再生リスト取得失敗 → search APIにフォールバック
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: [] }), // アップロード情報なし
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSearchResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockVideosResponse,
        });

      const result = await client.getLatestVideos('test-channel-id', 1);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('test-video-id');

      // search APIが呼ばれることを確認
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://www.googleapis.com/youtube/v3/search')
      );
    });

    it('should handle API errors', async () => {
      // チャンネル情報取得でエラー → search APIでもエラー
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
        });

      await expect(
        client.getLatestVideos('test-channel-id', 1)
      ).rejects.toThrow(
        'YouTube API Error: The request cannot be completed because you have exceeded your quota.'
      );
    });
  });

  describe('getChannelInfo', () => {
    it('should fetch and transform channel data correctly', async () => {
      (global.fetch as any).mockResolvedValueOnce({
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
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      });

      await expect(
        client.getChannelInfo('nonexistent-channel')
      ).rejects.toThrow('Channel not found: nonexistent-channel');
    });
  });

  describe('getLatestVideosForChannels', () => {
    it('should fetch videos for single channel', async () => {
      // アップロード情報なし → search API → videos API の順
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: [] }), // アップロード情報なし
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSearchResponse, // search API成功
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockVideosResponse, // videos API成功
        });

      const result = await client.getLatestVideosForChannels(['channel1']);

      expect(Object.keys(result)).toHaveLength(1);
      expect(result['channel1']).toHaveLength(1);
      expect(result['channel1'][0].id).toBe('test-video-id');
    });

    it('should handle failures gracefully', async () => {
      // ネットワークエラー
      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const result = await client.getLatestVideosForChannels(['channel1']);

      expect(Object.keys(result)).toHaveLength(1);
      expect(result['channel1']).toHaveLength(0); // エラーの場合は空配列
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      // 最初のAPI呼び出しでネットワークエラー → search APIでもネットワークエラー
      (global.fetch as any)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'));

      await expect(
        client.getLatestVideos('test-channel-id', 1)
      ).rejects.toThrow('Network error');
    });

    it('should handle 403 errors', async () => {
      // 最初のAPI呼び出しで403エラー → search APIでも403エラー
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: false,
          status: 403,
          json: async () => ({
            error: {
              code: 403,
              message: 'Forbidden',
            },
          }),
        })
        .mockResolvedValueOnce({
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
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should handle videos with only default thumbnails', async () => {
      const videosResponseWithDefaultOnly = {
        items: [
          {
            id: 'test-video-id',
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
            contentDetails: {
              duration: 'PT5M30S',
            },
            status: {
              privacyStatus: 'public',
            },
          },
        ],
      };

      // アップロード再生リストを使用
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockChannelUploadsResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlaylistResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => videosResponseWithDefaultOnly,
        });

      const result = await client.getLatestVideos('test-channel-id', 1);

      expect(result[0].thumbnail).toBe(
        'https://example.com/thumbnail-default.jpg'
      );
    });

    it('should handle empty video results', async () => {
      // アップロード情報なし → search APIでも結果なし
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: [] }), // アップロード情報なし
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: [] }), // search結果なし
        });

      const result = await client.getLatestVideos('test-channel-id', 1);

      expect(result).toHaveLength(0);
    });

    it('should handle custom maxResults parameter', async () => {
      // アップロード再生リストを使用
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockChannelUploadsResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockPlaylistResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockVideosResponse,
        });

      await client.getLatestVideos('test-channel-id', 5);

      // プレイリストアイテム取得でmaxResultsが使用されることを確認
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('maxResults=50') // 5 * 10 = 50
      );
    });
  });
});

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
