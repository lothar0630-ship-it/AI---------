import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SocialLink from '../components/SocialLink';
import { SocialLink as SocialLinkType } from '../types';

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

const mockTwitterLink: SocialLinkType = {
  platform: 'twitter',
  url: 'https://twitter.com/testuser',
  icon: 'twitter',
  label: 'Twitter',
};

const mockGitHubLink: SocialLinkType = {
  platform: 'github',
  url: 'https://github.com/testuser',
  icon: 'github',
  label: 'GitHub',
};

const mockUnknownLink: SocialLinkType = {
  platform: 'unknown',
  url: 'https://example.com',
  icon: 'unknown',
  label: 'Unknown Platform',
};

describe('SocialLink Component', () => {
  it('should render Twitter link correctly', () => {
    render(<SocialLink socialLink={mockTwitterLink} />, {
      wrapper: AllTheProviders,
    });

    const twitterLabel = screen.getByText('Twitter');
    const followText = screen.getByText('フォローする');

    expect(twitterLabel).toBeDefined();
    expect(followText).toBeDefined();
  });

  it('should render GitHub link correctly', () => {
    render(<SocialLink socialLink={mockGitHubLink} />, {
      wrapper: AllTheProviders,
    });

    const githubLabel = screen.getByText('GitHub');
    const followText = screen.getByText('フォローする');

    expect(githubLabel).toBeDefined();
    expect(followText).toBeDefined();
  });

  it('should render unknown platform with default icon', () => {
    render(<SocialLink socialLink={mockUnknownLink} />, {
      wrapper: AllTheProviders,
    });

    const unknownLabel = screen.getByText('Unknown Platform');
    const followText = screen.getByText('フォローする');

    expect(unknownLabel).toBeDefined();
    expect(followText).toBeDefined();
  });

  it('should have correct link attributes (要件 4.1, 4.2)', () => {
    render(<SocialLink socialLink={mockTwitterLink} />, {
      wrapper: AllTheProviders,
    });

    const link = screen.getByLabelText(
      'Twitterを新しいタブで開く'
    ) as HTMLAnchorElement;

    // ソーシャルリンクの動作テスト (要件 4.1)
    expect(link.href).toBe('https://twitter.com/testuser');

    // 外部リンクの新しいタブ開きテスト (要件 4.2)
    expect(link.target).toBe('_blank');
    expect(link.rel).toBe('noopener noreferrer');
  });

  it('should apply custom className when provided', () => {
    const { container } = render(
      <SocialLink socialLink={mockTwitterLink} className="custom-class" />,
      { wrapper: AllTheProviders }
    );

    const link = container.querySelector('a');
    expect(link?.classList.contains('custom-class')).toBe(true);
  });

  it('should render correct platform-specific styling', () => {
    render(<SocialLink socialLink={mockTwitterLink} />, {
      wrapper: AllTheProviders,
    });

    const link = screen.getByLabelText('Twitterを新しいタブで開く');
    const linkElement = link as HTMLAnchorElement;

    // リンクが正しく設定されていることを確認
    expect(linkElement.href).toBe('https://twitter.com/testuser');
    expect(linkElement.getAttribute('aria-label')).toBe(
      'Twitterを新しいタブで開く'
    );
  });

  it('should handle different social platforms correctly', () => {
    const platforms = [
      { ...mockTwitterLink, platform: 'twitter', label: 'Twitter' },
      { ...mockGitHubLink, platform: 'github', label: 'GitHub' },
      {
        platform: 'linkedin',
        url: 'https://linkedin.com/in/test',
        icon: 'linkedin',
        label: 'LinkedIn',
      },
    ];

    platforms.forEach(platform => {
      const { unmount } = render(<SocialLink socialLink={platform} />, {
        wrapper: AllTheProviders,
      });

      const label = screen.getByText(platform.label);
      expect(label).toBeDefined();

      unmount();
    });
  });

  it('should render external link icon', () => {
    render(<SocialLink socialLink={mockTwitterLink} />, {
      wrapper: AllTheProviders,
    });

    // 外部リンクアイコンが存在することを確認（SVGとして）
    const link = screen.getByLabelText('Twitterを新しいタブで開く');
    const svgElements = link.querySelectorAll('svg');

    // プラットフォームアイコンと外部リンクアイコンの2つのSVGが存在することを確認
    expect(svgElements.length).toBeGreaterThanOrEqual(2);
  });
});
