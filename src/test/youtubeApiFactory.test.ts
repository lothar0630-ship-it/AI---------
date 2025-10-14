import { describe, it, expect, vi } from 'vitest';
import { createYouTubeClient, YouTubeAPIClient } from '../utils/youtubeApi';

// Mock import.meta.env
vi.mock('import.meta', () => ({
  env: {
    VITE_YOUTUBE_API_KEY: 'test-api-key',
  },
}));

describe('createYouTubeClient', () => {
  it('should create client when API key is available', () => {
    // Mock with valid API key
    vi.mocked(import.meta.env).VITE_YOUTUBE_API_KEY = 'test-api-key';

    const client = createYouTubeClient();
    expect(client).toBeInstanceOf(YouTubeAPIClient);
  });

  it('should return null when API key is missing', () => {
    // Mock with empty API key
    vi.mocked(import.meta.env).VITE_YOUTUBE_API_KEY = '';

    const client = createYouTubeClient();
    expect(client).toBeNull();
  });

  it('should return null when API key is undefined', () => {
    // Mock with undefined API key by deleting the property
    delete vi.mocked(import.meta.env).VITE_YOUTUBE_API_KEY;

    const client = createYouTubeClient();
    expect(client).toBeNull();
  });
});
