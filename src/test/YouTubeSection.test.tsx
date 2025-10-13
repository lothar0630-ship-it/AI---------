import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import YouTubeSection from '../components/YouTubeSection';
import ChannelCard from '../components/ChannelCard';
import VideoCard from '../components/VideoCard';
import { AllTheProviders } from './utils';
import { YouTubeChannel } from '../types';

// YouTube API関連のモック
vi.mock('../hooks/useYouTubeVideos', () => ({
  useYouTubeData: vi.fn(),
  useYouTubeAvailability: vi.fn(),
}));

import {
  useYouTubeData,
  useYouTubeAvailability,
} from '../hooks/useYouTubeVideos';

const mockChannels: YouTubeChannel[] = [
  {
    id: 'UCfwwSQO4_ONXzO-vLO_P8dA',
    name: 'ゲーム実況チャンネル',
    description:
      'MHWの縛りプレイを中心にゲーム実況動画、配信をやっているチャンネル。',
    url: 'https://youtube.com/channel/UCfwwSQO4_ONXzO-vLO_P8dA',
    customUrl: '@techchannel',
  },
  {
    id: 'UCax82t3Xqk1rm0w55Iv_UXg',
    name: 'ライフスタイルチャンネル',
    description:
      '動画勢Vtuberとして毎月25日に動画をあげているチャンネル。メインコンテンツはモノづくりとVlog',
    url: 'https://youtube.com/channel/UCax82t3Xqk1rm0w55Iv_UXg',
    customUrl: '@lifestyle',
  },
];

const mockVideo = {
  id: 'test-video-1',
  title: 'テスト動画タイトル',
  description: 'テスト動画の説明',
  thumbnail: 'https://example.com/thumbnail.jpg',
  publishedAt: '2024-01-01T00:00:00Z',
  url: 'https://youtube.com/watch?v=test-video-1',
};

const mockChannelWithVideo = {
  ...mockChannels[0],
  videos: [mockVideo],
  hasApiData: true,
};

describe('YouTubeSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render YouTube section with channels', () => {
    // モックの設定
    (useYouTubeAvailability as any).mockReturnValue({
      isAvailable: true,
      hasApiKey: true,
    });

    (useYouTubeData as any).mockReturnValue({
      data: mockChannels.map(channel => ({
        ...channel,
        videos: [mockVideo],
        hasApiData: true,
      })),
      isLoading: false,
      error: { videos: null, channels: null },
    });

    render(
      <AllTheProviders>
        <YouTubeSection channels={mockChannels} />
      </AllTheProviders>
    );

    // セクションタイトルの確認
    expect(screen.getByText('YouTube チャンネル')).toBeInTheDocument();

    // チャンネル名の確認
    expect(screen.getByText('ゲーム実況チャンネル')).toBeInTheDocument();
    expect(screen.getByText('ライフスタイルチャンネル')).toBeInTheDocument();

    // チャンネル説明の確認
    expect(screen.getByText(/MHWの縛りプレイを中心に/)).toBeInTheDocument();
    expect(screen.getByText(/動画勢Vtuberとして/)).toBeInTheDocument();
  });

  it('should show loading state', () => {
    (useYouTubeAvailability as any).mockReturnValue({
      isAvailable: true,
      hasApiKey: true,
    });

    (useYouTubeData as any).mockReturnValue({
      data: [],
      isLoading: true,
      error: { videos: null, channels: null },
    });

    render(
      <AllTheProviders>
        <YouTubeSection channels={mockChannels} />
      </AllTheProviders>
    );

    expect(screen.getByText('最新動画を読み込み中...')).toBeInTheDocument();
  });

  it('should show API key missing warning', () => {
    (useYouTubeAvailability as any).mockReturnValue({
      isAvailable: false,
      hasApiKey: false,
    });

    (useYouTubeData as any).mockReturnValue({
      data: mockChannels,
      isLoading: false,
      error: { videos: null, channels: null },
    });

    render(
      <AllTheProviders>
        <YouTubeSection channels={mockChannels} />
      </AllTheProviders>
    );

    expect(screen.getByText('YouTube API 連携が無効です')).toBeInTheDocument();
  });

  it('should show error state', () => {
    (useYouTubeAvailability as any).mockReturnValue({
      isAvailable: true,
      hasApiKey: true,
    });

    (useYouTubeData as any).mockReturnValue({
      data: mockChannels,
      isLoading: false,
      error: {
        videos: { 'UCfwwSQO4_ONXzO-vLO_P8dA': 'API Error' },
        channels: null,
      },
    });

    render(
      <AllTheProviders>
        <YouTubeSection channels={mockChannels} />
      </AllTheProviders>
    );

    expect(screen.getByText('データ取得エラー')).toBeInTheDocument();
  });

  it('should handle empty channels', () => {
    (useYouTubeAvailability as any).mockReturnValue({
      isAvailable: true,
      hasApiKey: true,
    });

    (useYouTubeData as any).mockReturnValue({
      data: [],
      isLoading: false,
      error: { videos: null, channels: null },
    });

    render(
      <AllTheProviders>
        <YouTubeSection channels={[]} />
      </AllTheProviders>
    );

    expect(
      screen.getByText('YouTube チャンネルが設定されていません。')
    ).toBeInTheDocument();
  });
});

describe('ChannelCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render channel card with basic information', () => {
    render(
      <AllTheProviders>
        <ChannelCard
          channel={mockChannelWithVideo}
          isLoading={false}
          hasApiConnection={true}
        />
      </AllTheProviders>
    );

    // チャンネル名の確認
    expect(screen.getByText('ゲーム実況チャンネル')).toBeInTheDocument();

    // チャンネル説明の確認
    expect(screen.getByText(/MHWの縛りプレイを中心に/)).toBeInTheDocument();

    // チャンネルリンクの確認
    expect(screen.getByText('チャンネルを見る')).toBeInTheDocument();

    // API連携ステータスの確認
    expect(screen.getByText('API連携')).toBeInTheDocument();
  });

  it('should render channel card without API connection', () => {
    const channelWithoutApi = {
      ...mockChannels[0],
      hasApiData: false,
    };

    render(
      <AllTheProviders>
        <ChannelCard
          channel={channelWithoutApi}
          isLoading={false}
          hasApiConnection={false}
        />
      </AllTheProviders>
    );

    // 設定ファイルステータスの確認
    expect(screen.getByText('設定ファイル')).toBeInTheDocument();

    // オフラインステータスの確認
    expect(screen.getByText('オフライン')).toBeInTheDocument();

    // フォールバックメッセージの確認
    expect(
      screen.getByText('最新動画を確認するには、チャンネルページをご覧ください')
    ).toBeInTheDocument();
  });

  it('should show loading state in channel card', () => {
    render(
      <AllTheProviders>
        <ChannelCard
          channel={mockChannels[0]}
          isLoading={true}
          hasApiConnection={true}
        />
      </AllTheProviders>
    );

    // ローディングスピナーの確認（アニメーションクラスで判定）
    const loadingElement = document.querySelector('.animate-spin');
    expect(loadingElement).toBeInTheDocument();
  });

  it('should render video card when video is available', () => {
    render(
      <AllTheProviders>
        <ChannelCard
          channel={mockChannelWithVideo}
          isLoading={false}
          hasApiConnection={true}
        />
      </AllTheProviders>
    );

    // 動画タイトルの確認
    expect(screen.getByText('テスト動画タイトル')).toBeInTheDocument();

    // 最新動画セクションの確認
    expect(screen.getByText('最新動画')).toBeInTheDocument();
  });

  it('should show no video message when no videos available', () => {
    const channelWithoutVideo = {
      ...mockChannels[0],
      videos: [],
      hasApiData: true,
    };

    render(
      <AllTheProviders>
        <ChannelCard
          channel={channelWithoutVideo}
          isLoading={false}
          hasApiConnection={true}
        />
      </AllTheProviders>
    );

    // 動画なしメッセージの確認
    expect(
      screen.getByText('最新動画を取得できませんでした')
    ).toBeInTheDocument();
  });

  it('should show API connection required message when no API', () => {
    const channelWithoutVideo = {
      ...mockChannels[0],
      videos: [],
      hasApiData: false,
    };

    render(
      <AllTheProviders>
        <ChannelCard
          channel={channelWithoutVideo}
          isLoading={false}
          hasApiConnection={false}
        />
      </AllTheProviders>
    );

    // API連携必要メッセージの確認
    expect(
      screen.getByText('動画情報を表示するにはAPI連携が必要です')
    ).toBeInTheDocument();
  });
});

describe('VideoCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render video card with all information', () => {
    render(
      <AllTheProviders>
        <VideoCard video={mockVideo} />
      </AllTheProviders>
    );

    // 動画タイトルの確認
    expect(screen.getByText('テスト動画タイトル')).toBeInTheDocument();

    // 投稿日の確認（日本語フォーマット）
    expect(screen.getByText('2024年1月1日')).toBeInTheDocument();

    // サムネイル画像の確認
    const thumbnail = screen.getByAltText('テスト動画タイトル');
    expect(thumbnail).toBeInTheDocument();
    expect(thumbnail).toHaveAttribute(
      'src',
      'https://example.com/thumbnail.jpg'
    );
  });

  it('should truncate long video titles', () => {
    const longTitleVideo = {
      ...mockVideo,
      title:
        'これは非常に長いタイトルで、60文字を超える場合に切り詰められるべきテストケースです。この部分は表示されないはずです。追加テキスト',
    };

    render(
      <AllTheProviders>
        <VideoCard video={longTitleVideo} />
      </AllTheProviders>
    );

    // 切り詰められたタイトルの確認（60文字 + "..."）
    const expectedTruncatedTitle =
      'これは非常に長いタイトルで、60文字を超える場合に切り詰められるべきテストケースです。この部分は表示されないはずです。追...';
    expect(screen.getByText(expectedTruncatedTitle)).toBeInTheDocument();
  });

  it('should have correct external link attributes', () => {
    render(
      <AllTheProviders>
        <VideoCard video={mockVideo} />
      </AllTheProviders>
    );

    // リンク要素の確認
    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute(
      'href',
      'https://youtube.com/watch?v=test-video-1'
    );
    expect(linkElement).toHaveAttribute('target', '_blank');
    expect(linkElement).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should format date correctly in Japanese', () => {
    const testVideo = {
      ...mockVideo,
      publishedAt: '2023-12-25T00:00:00Z',
    };

    render(
      <AllTheProviders>
        <VideoCard video={testVideo} />
      </AllTheProviders>
    );

    // 日本語日付フォーマットの確認（タイムゾーンの影響を考慮）
    const dateElement = screen.getByText(/2023年12月(25|26)日/);
    expect(dateElement).toBeInTheDocument();
  });
});

describe('YouTube Section - API Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show video error fallback display', () => {
    (useYouTubeAvailability as any).mockReturnValue({
      isAvailable: true,
      hasApiKey: true,
    });

    (useYouTubeData as any).mockReturnValue({
      data: mockChannels,
      isLoading: false,
      error: {
        videos: { 'UCfwwSQO4_ONXzO-vLO_P8dA': 'Video fetch failed' },
        channels: null,
      },
    });

    render(
      <AllTheProviders>
        <YouTubeSection channels={mockChannels} />
      </AllTheProviders>
    );

    // エラーメッセージの確認
    expect(screen.getByText('データ取得エラー')).toBeInTheDocument();
    expect(
      screen.getByText(
        '動画情報の取得に失敗しました。設定ファイルの情報を表示しています。'
      )
    ).toBeInTheDocument();
  });

  it('should show channel error fallback display', () => {
    (useYouTubeAvailability as any).mockReturnValue({
      isAvailable: true,
      hasApiKey: true,
    });

    (useYouTubeData as any).mockReturnValue({
      data: mockChannels,
      isLoading: false,
      error: {
        videos: null,
        channels: 'Channel fetch failed',
      },
    });

    render(
      <AllTheProviders>
        <YouTubeSection channels={mockChannels} />
      </AllTheProviders>
    );

    // チャンネルエラーメッセージの確認
    expect(screen.getByText('データ取得エラー')).toBeInTheDocument();
    expect(
      screen.getByText('チャンネル情報の取得に失敗しました。')
    ).toBeInTheDocument();
  });

  it('should show both video and channel error messages', () => {
    (useYouTubeAvailability as any).mockReturnValue({
      isAvailable: true,
      hasApiKey: true,
    });

    (useYouTubeData as any).mockReturnValue({
      data: mockChannels,
      isLoading: false,
      error: {
        videos: { 'UCfwwSQO4_ONXzO-vLO_P8dA': 'Video error' },
        channels: 'Channel error',
      },
    });

    render(
      <AllTheProviders>
        <YouTubeSection channels={mockChannels} />
      </AllTheProviders>
    );

    // 両方のエラーメッセージの確認
    expect(screen.getByText('データ取得エラー')).toBeInTheDocument();
    expect(
      screen.getByText(
        '動画情報の取得に失敗しました。設定ファイルの情報を表示しています。'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('チャンネル情報の取得に失敗しました。')
    ).toBeInTheDocument();
  });

  it('should show API unavailable fallback display', () => {
    (useYouTubeAvailability as any).mockReturnValue({
      isAvailable: false,
      hasApiKey: true,
    });

    (useYouTubeData as any).mockReturnValue({
      data: mockChannels,
      isLoading: false,
      error: { videos: null, channels: null },
    });

    render(
      <AllTheProviders>
        <YouTubeSection channels={mockChannels} />
      </AllTheProviders>
    );

    // API利用不可メッセージの確認
    expect(screen.getByText('YouTube API エラー')).toBeInTheDocument();
    expect(
      screen.getByText(
        'YouTube API に接続できません。設定ファイルの情報のみを表示しています。'
      )
    ).toBeInTheDocument();
  });

  it('should render channels even with API errors', () => {
    (useYouTubeAvailability as any).mockReturnValue({
      isAvailable: false,
      hasApiKey: false,
    });

    (useYouTubeData as any).mockReturnValue({
      data: mockChannels.map(channel => ({
        ...channel,
        hasApiData: false,
      })),
      isLoading: false,
      error: { videos: null, channels: null },
    });

    render(
      <AllTheProviders>
        <YouTubeSection channels={mockChannels} />
      </AllTheProviders>
    );

    // チャンネル情報は表示される
    expect(screen.getByText('ゲーム実況チャンネル')).toBeInTheDocument();
    expect(screen.getByText('ライフスタイルチャンネル')).toBeInTheDocument();

    // API連携無効メッセージも表示される
    expect(screen.getByText('YouTube API 連携が無効です')).toBeInTheDocument();
  });
});

describe('YouTube Section - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle undefined video data gracefully', () => {
    const channelWithUndefinedVideo = {
      ...mockChannels[0],
      videos: undefined,
      hasApiData: true,
    };

    render(
      <AllTheProviders>
        <ChannelCard
          channel={channelWithUndefinedVideo}
          isLoading={false}
          hasApiConnection={true}
        />
      </AllTheProviders>
    );

    // 動画なしメッセージの確認
    expect(
      screen.getByText('最新動画を取得できませんでした')
    ).toBeInTheDocument();
  });

  it('should handle empty video array', () => {
    const channelWithEmptyVideos = {
      ...mockChannels[0],
      videos: [],
      hasApiData: true,
    };

    render(
      <AllTheProviders>
        <ChannelCard
          channel={channelWithEmptyVideos}
          isLoading={false}
          hasApiConnection={true}
        />
      </AllTheProviders>
    );

    // 動画なしメッセージの確認
    expect(
      screen.getByText('最新動画を取得できませんでした')
    ).toBeInTheDocument();
  });

  it('should show correct message when API is available but no API key', () => {
    (useYouTubeAvailability as any).mockReturnValue({
      isAvailable: true,
      hasApiKey: false,
    });

    (useYouTubeData as any).mockReturnValue({
      data: mockChannels,
      isLoading: false,
      error: { videos: null, channels: null },
    });

    render(
      <AllTheProviders>
        <YouTubeSection channels={mockChannels} />
      </AllTheProviders>
    );

    // API キー不足メッセージの確認
    expect(screen.getByText('YouTube API 連携が無効です')).toBeInTheDocument();
    expect(
      screen.getByText(
        '設定ファイルの情報のみを表示しています。最新動画を表示するには API キーの設定が必要です。'
      )
    ).toBeInTheDocument();
  });

  it('should handle mixed API connection states', () => {
    const mixedChannelData = [
      {
        ...mockChannels[0],
        videos: [mockVideo],
        hasApiData: true,
      },
      {
        ...mockChannels[1],
        videos: [],
        hasApiData: false,
      },
    ];

    (useYouTubeAvailability as any).mockReturnValue({
      isAvailable: true,
      hasApiKey: true,
    });

    (useYouTubeData as any).mockReturnValue({
      data: mixedChannelData,
      isLoading: false,
      error: { videos: null, channels: null },
    });

    render(
      <AllTheProviders>
        <YouTubeSection channels={mockChannels} />
      </AllTheProviders>
    );

    // 両方のチャンネルが表示される
    expect(screen.getByText('ゲーム実況チャンネル')).toBeInTheDocument();
    expect(screen.getByText('ライフスタイルチャンネル')).toBeInTheDocument();

    // API連携とファイル設定の両方のステータスが表示される
    expect(screen.getByText('API連携')).toBeInTheDocument();
    expect(screen.getByText('設定ファイル')).toBeInTheDocument();
  });
});
