import { vi } from 'vitest';

// Mock YouTube API responses
export const mockYouTubeChannel = {
  id: 'UCtest123',
  name: 'Test Channel',
  description: 'Test channel description',
  url: 'https://youtube.com/channel/UCtest123',
};

export const mockYouTubeVideo = {
  id: 'video123',
  title: 'Test Video Title',
  description: 'Test video description',
  thumbnail: 'https://img.youtube.com/vi/video123/maxresdefault.jpg',
  publishedAt: '2024-01-01T00:00:00Z',
  url: 'https://youtube.com/watch?v=video123',
};

export const mockPersonalInfo = {
  name: 'Test Developer',
  title: 'Software Engineer',
  description: 'Test description',
  avatar: '/test-avatar.jpg',
};

export const mockSocialLink = {
  platform: 'twitter',
  url: 'https://twitter.com/testuser',
  icon: 'twitter',
  label: 'Twitter',
};

export const mockSiteConfig = {
  personalInfo: mockPersonalInfo,
  youtubeChannels: [mockYouTubeChannel],
  socialLinks: [mockSocialLink],
  theme: {
    primaryColor: '#3B82F6',
    secondaryColor: '#1F2937',
    accentColor: '#F59E0B',
  },
};

// Mock fetch responses
export const mockFetch = vi.fn();

// YouTube API mock response
export const mockYouTubeApiResponse = {
  items: [
    {
      id: { videoId: 'video123' },
      snippet: {
        title: 'Test Video Title',
        description: 'Test video description',
        publishedAt: '2024-01-01T00:00:00Z',
        thumbnails: {
          medium: { url: 'https://img.youtube.com/vi/video123/mqdefault.jpg' },
          high: { url: 'https://img.youtube.com/vi/video123/hqdefault.jpg' },
        },
      },
    },
  ],
};

// Mock IntersectionObserver entries
export const mockIntersectionObserverEntry = {
  isIntersecting: true,
  target: document.createElement('div'),
  intersectionRatio: 1,
  boundingClientRect: {} as DOMRectReadOnly,
  intersectionRect: {} as DOMRectReadOnly,
  rootBounds: {} as DOMRectReadOnly,
  time: Date.now(),
};
