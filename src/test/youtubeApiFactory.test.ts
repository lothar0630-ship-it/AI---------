import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// 環境変数のモック
const mockEnv = vi.hoisted(() => ({
  VITE_YOUTUBE_API_KEY: 'test-api-key',
}));

vi.mock('import.meta', () => ({
  env: mockEnv,
}));

describe('createYouTubeClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create client when API key is available', async () => {
    mockEnv.VITE_YOUTUBE_API_KEY = 'test-api-key';

    // 動的インポートでモジュールを再読み込み
    const { createYouTubeClient, YouTubeAPIClient } = await import(
      '../utils/youtubeApi'
    );

    const client = createYouTubeClient();
    expect(client).toBeInstanceOf(YouTubeAPIClient);
  });

  it('should return null when API key is missing', async () => {
    mockEnv.VITE_YOUTUBE_API_KEY = '';

    // 動的インポートでモジュールを再読み込み
    const { createYouTubeClient } = await import('../utils/youtubeApi');

    const client = createYouTubeClient();
    expect(client).toBeNull();
  });

  it('should return null when API key is undefined', async () => {
    mockEnv.VITE_YOUTUBE_API_KEY = undefined;

    // 動的インポートでモジュールを再読み込み
    const { createYouTubeClient } = await import('../utils/youtubeApi');

    const client = createYouTubeClient();
    expect(client).toBeNull();
  });
});
