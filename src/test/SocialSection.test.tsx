import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SocialSection from '../components/SocialSection';
import { SocialLink } from '../types';

// テスト用のプロバイダー
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockSocialLinks: SocialLink[] = [
  {
    platform: 'twitter',
    url: 'https://twitter.com/testuser',
    icon: 'twitter',
    label: 'Twitter',
  },
  {
    platform: 'github',
    url: 'https://github.com/testuser',
    icon: 'github',
    label: 'GitHub',
  },
];

describe('SocialSection Component', () => {
  beforeEach(() => {
    // Mock window.scrollTo for scroll tests
    vi.stubGlobal('scrollTo', vi.fn());
  });

  it('should render social section with title', () => {
    render(<SocialSection socialLinks={mockSocialLinks} />, {
      wrapper: AllTheProviders,
    });

    const title = screen.getByText('つながりましょう');
    expect(title).toBeDefined();
    expect(title.textContent).toBe('つながりましょう');
  });

  it('should render social links when provided', () => {
    render(<SocialSection socialLinks={mockSocialLinks} />, {
      wrapper: AllTheProviders,
    });

    const twitterLink = screen.getByText('Twitter');
    const githubLink = screen.getByText('GitHub');

    expect(twitterLink).toBeDefined();
    expect(githubLink).toBeDefined();
  });

  it('should render empty state when no social links provided', () => {
    render(<SocialSection socialLinks={[]} />, { wrapper: AllTheProviders });

    const emptyMessage = screen.getByText(
      'ソーシャルメディアリンクが設定されていません。'
    );
    expect(emptyMessage).toBeDefined();
  });

  it('should render social links with correct URLs', () => {
    render(<SocialSection socialLinks={mockSocialLinks} />, {
      wrapper: AllTheProviders,
    });

    const twitterLink = screen.getByLabelText(
      'Twitterを開く'
    ) as HTMLAnchorElement;
    const githubLink = screen.getByLabelText(
      'GitHubを開く'
    ) as HTMLAnchorElement;

    expect(twitterLink.href).toBe('https://twitter.com/testuser');
    expect(githubLink.href).toBe('https://github.com/testuser');
  });

  it('should open links in new tab (要件 4.2)', () => {
    render(<SocialSection socialLinks={mockSocialLinks} />, {
      wrapper: AllTheProviders,
    });

    const twitterLink = screen.getByLabelText(
      'Twitterを開く'
    ) as HTMLAnchorElement;
    const githubLink = screen.getByLabelText(
      'GitHubを開く'
    ) as HTMLAnchorElement;

    // 新しいタブで開くことを確認
    expect(twitterLink.target).toBe('_blank');
    expect(twitterLink.rel).toBe('noopener noreferrer');
    expect(githubLink.target).toBe('_blank');
    expect(githubLink.rel).toBe('noopener noreferrer');
  });

  it('should handle scroll to bottom functionality', () => {
    render(<SocialSection socialLinks={mockSocialLinks} />, {
      wrapper: AllTheProviders,
    });

    const scrollButton = screen.getByLabelText('ページの最下部へ移動');
    fireEvent.click(scrollButton);

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
  });

  it('should render section with proper accessibility attributes', () => {
    const { container } = render(
      <SocialSection socialLinks={mockSocialLinks} />,
      {
        wrapper: AllTheProviders,
      }
    );

    const section = container.querySelector('#social');
    expect(section).toBeDefined();
    expect(section?.tagName.toLowerCase()).toBe('section');
    expect(section?.id).toBe('social');
  });

  it('should render multiple social links correctly', () => {
    const multipleSocialLinks: SocialLink[] = [
      ...mockSocialLinks,
      {
        platform: 'linkedin',
        url: 'https://linkedin.com/in/testuser',
        icon: 'linkedin',
        label: 'LinkedIn',
      },
    ];

    render(<SocialSection socialLinks={multipleSocialLinks} />, {
      wrapper: AllTheProviders,
    });

    expect(screen.getByText('Twitter')).toBeDefined();
    expect(screen.getByText('GitHub')).toBeDefined();
    expect(screen.getByText('LinkedIn')).toBeDefined();
  });
});
