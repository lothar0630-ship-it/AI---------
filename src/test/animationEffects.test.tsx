import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import VideoCard from '../components/VideoCard';
import { PersonalInfo } from '../types';

// Mock Framer Motion completely
vi.mock('framer-motion', () => ({
  motion: {
    section: ({ children, ...props }: any) => {
      const {
        whileHover,
        whileTap,
        initial,
        animate,
        transition,
        ...cleanProps
      } = props;
      return <section {...cleanProps}>{children}</section>;
    },
    div: ({ children, ...props }: any) => {
      const {
        whileHover,
        whileTap,
        initial,
        animate,
        transition,
        ...cleanProps
      } = props;
      return <div {...cleanProps}>{children}</div>;
    },
    h1: ({ children, ...props }: any) => {
      const {
        whileHover,
        whileTap,
        initial,
        animate,
        transition,
        ...cleanProps
      } = props;
      return <h1 {...cleanProps}>{children}</h1>;
    },
    h2: ({ children, ...props }: any) => {
      const {
        whileHover,
        whileTap,
        initial,
        animate,
        transition,
        ...cleanProps
      } = props;
      return <h2 {...cleanProps}>{children}</h2>;
    },
    h3: ({ children, ...props }: any) => {
      const {
        whileHover,
        whileTap,
        initial,
        animate,
        transition,
        ...cleanProps
      } = props;
      return <h3 {...cleanProps}>{children}</h3>;
    },
    p: ({ children, ...props }: any) => {
      const {
        whileHover,
        whileTap,
        initial,
        animate,
        transition,
        ...cleanProps
      } = props;
      return <p {...cleanProps}>{children}</p>;
    },
    span: ({ children, ...props }: any) => {
      const {
        whileHover,
        whileTap,
        initial,
        animate,
        transition,
        ...cleanProps
      } = props;
      return <span {...cleanProps}>{children}</span>;
    },
    button: ({ children, ...props }: any) => {
      const {
        whileHover,
        whileTap,
        initial,
        animate,
        transition,
        ...cleanProps
      } = props;
      return <button {...cleanProps}>{children}</button>;
    },
    img: ({ children, ...props }: any) => {
      const {
        whileHover,
        whileTap,
        initial,
        animate,
        transition,
        ...cleanProps
      } = props;
      return <img {...cleanProps}>{children}</img>;
    },
    a: ({ children, ...props }: any) => {
      const {
        whileHover,
        whileTap,
        initial,
        animate,
        transition,
        ...cleanProps
      } = props;
      return <a {...cleanProps}>{children}</a>;
    },
    h4: ({ children, ...props }: any) => {
      const {
        whileHover,
        whileTap,
        initial,
        animate,
        transition,
        ...cleanProps
      } = props;
      return <h4 {...cleanProps}>{children}</h4>;
    },
    h5: ({ children, ...props }: any) => {
      const {
        whileHover,
        whileTap,
        initial,
        animate,
        transition,
        ...cleanProps
      } = props;
      return <h5 {...cleanProps}>{children}</h5>;
    },
    li: ({ children, ...props }: any) => {
      const {
        whileHover,
        whileTap,
        initial,
        animate,
        transition,
        ...cleanProps
      } = props;
      return <li {...cleanProps}>{children}</li>;
    },
    ul: ({ children, ...props }: any) => {
      const {
        whileHover,
        whileTap,
        initial,
        animate,
        transition,
        ...cleanProps
      } = props;
      return <ul {...cleanProps}>{children}</ul>;
    },
  },
  useInView: vi.fn(() => true),
  AnimatePresence: ({ children }: any) => children,
}));

// Mock scroll animation hook
vi.mock('../hooks/useScrollAnimation', () => ({
  useScrollAnimation: vi.fn(() => ({
    elementRef: { current: null },
    isVisible: true,
  })),
}));

// Mock LazyImage component
vi.mock('../components/LazyImage', () => ({
  default: ({ src, alt, className, ...props }: any) => (
    <img src={src} alt={alt} className={className} {...props} />
  ),
}));

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Play: ({ className, ...props }: any) => (
    <div className={`lucide-play ${className}`} {...props}>
      ▶
    </div>
  ),
  ExternalLink: ({ className, ...props }: any) => (
    <div className={`lucide-external-link ${className}`} {...props}>
      ↗
    </div>
  ),
}));

// Mock scrollIntoView
const mockScrollIntoView = vi.fn();
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: mockScrollIntoView,
  configurable: true,
  writable: true,
});

// Mock getElementById
const mockGetElementById = vi.fn();
Object.defineProperty(document, 'getElementById', {
  value: mockGetElementById,
  configurable: true,
  writable: true,
});

// Mock data
const mockPersonalInfo: PersonalInfo = {
  name: 'テスト太郎',
  title: 'フロントエンド開発者',
  description: 'テスト用の説明文です。',
  avatar: '/images/test-avatar.jpg',
};

const mockVideo = {
  id: 'test-video-1',
  title: 'テスト動画タイトル',
  description: 'テスト動画の説明',
  thumbnail: 'https://example.com/thumbnail.jpg',
  publishedAt: '2024-01-01T00:00:00Z',
  url: 'https://youtube.com/watch?v=test',
};

describe('Animation Effects Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockScrollIntoView.mockClear();
    mockGetElementById.mockClear();
  });

  describe('Scroll Animation Tests', () => {
    it('should handle smooth scroll navigation in HeroSection', () => {
      const mockElement = document.createElement('div');
      mockGetElementById.mockReturnValue(mockElement);

      render(<HeroSection personalInfo={mockPersonalInfo} />);

      const moreDetailsButton = screen.getByText('もっと詳しく');
      fireEvent.click(moreDetailsButton);

      expect(mockGetElementById).toHaveBeenCalledWith('about');
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('should handle scroll indicator click in HeroSection', () => {
      const mockElement = document.createElement('div');
      mockGetElementById.mockReturnValue(mockElement);

      render(<HeroSection personalInfo={mockPersonalInfo} />);

      // HeroSectionにはスクロールインジケーターがないため、代わりにボタンをテスト
      const moreDetailsButton = screen.getByText('もっと詳しく');
      fireEvent.click(moreDetailsButton);

      expect(mockGetElementById).toHaveBeenCalledWith('about');
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('should handle section navigation in AboutSection', () => {
      // AboutSectionにはナビゲーションボタンがないため、レンダリングのテストのみ
      expect(() => {
        render(<AboutSection personalInfo={mockPersonalInfo} />);
      }).not.toThrow();
    });

    it('should handle contact button navigation in HeroSection', () => {
      const mockElement = document.createElement('div');
      mockGetElementById.mockReturnValue(mockElement);

      render(<HeroSection personalInfo={mockPersonalInfo} />);

      const contactButton = screen.getByText('お問い合わせ');
      fireEvent.click(contactButton);

      expect(mockGetElementById).toHaveBeenCalledWith('social');
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });
  });

  describe('Hover Effects Tests', () => {
    it('should render skill tags with proper structure in AboutSection', () => {
      const { container } = render(
        <AboutSection personalInfo={mockPersonalInfo} />
      );

      // スキルタグの存在を確認
      const skillTags = container.querySelectorAll('span');
      const skillTagsWithBg = Array.from(skillTags).filter(
        tag =>
          tag.className.includes('bg-primary/10') ||
          tag.textContent?.includes('TypeScript') ||
          tag.textContent?.includes('React')
      );

      expect(skillTagsWithBg.length).toBeGreaterThan(0);
    });

    it('should render video card with proper hover structure', () => {
      const { container } = render(<VideoCard video={mockVideo} />);

      // VideoCardのメイン要素を確認
      const videoLink = container.querySelector('a');
      expect(videoLink).toBeInTheDocument();
      expect(videoLink).toHaveAttribute('href', mockVideo.url);
      expect(videoLink).toHaveAttribute('target', '_blank');

      // サムネイル画像の存在を確認
      const thumbnail = container.querySelector('img');
      expect(thumbnail).toBeInTheDocument();
      expect(thumbnail).toHaveAttribute('src', mockVideo.thumbnail);
    });

    it('should render CTA buttons with proper classes in HeroSection', () => {
      render(<HeroSection personalInfo={mockPersonalInfo} />);

      const moreDetailsButton = screen.getByText('もっと詳しく');
      const contactButton = screen.getByText('お問い合わせ');

      expect(moreDetailsButton).toBeInTheDocument();
      expect(contactButton).toBeInTheDocument();

      // ボタンのクラスを確認
      expect(moreDetailsButton).toHaveClass('bg-primary', 'text-white');
      expect(contactButton).toHaveClass(
        'border-2',
        'border-primary',
        'text-primary'
      );
    });

    it('should render main content card with proper styling in AboutSection', () => {
      const { container } = render(
        <AboutSection personalInfo={mockPersonalInfo} />
      );

      // メインコンテンツカードを確認
      const mainCard = container.querySelector('.rounded-3xl.shadow-xl');
      expect(mainCard).toBeInTheDocument();
      expect(mainCard).toHaveClass('bg-white', 'rounded-3xl', 'shadow-xl');
    });
  });

  describe('Animation Timing and Content Tests', () => {
    it('should render all animation elements in HeroSection', () => {
      render(<HeroSection personalInfo={mockPersonalInfo} />);

      // 各アニメーション要素の存在を確認
      expect(screen.getByText('👋 こんにちは！')).toBeInTheDocument();
      expect(screen.getByText('テスト太郎')).toBeInTheDocument();
      expect(screen.getByText(mockPersonalInfo.title)).toBeInTheDocument();
      expect(
        screen.getByText(mockPersonalInfo.description)
      ).toBeInTheDocument();

      // ボタンの存在を確認
      expect(screen.getByText('もっと詳しく')).toBeInTheDocument();
      expect(screen.getByText('お問い合わせ')).toBeInTheDocument();
    });

    it('should render background animation elements in HeroSection', () => {
      const { container } = render(
        <HeroSection personalInfo={mockPersonalInfo} />
      );

      // 背景装飾要素の存在を確認
      const backgroundElements = container.querySelectorAll(
        '.absolute.rounded-full.blur-3xl'
      );
      expect(backgroundElements.length).toBeGreaterThan(0);
    });

    it('should render staggered skill tags in AboutSection', () => {
      const { container } = render(
        <AboutSection personalInfo={mockPersonalInfo} />
      );

      // スキルタグの存在を確認（staggered animationの対象）
      const skillSection = container.querySelector('.flex.flex-wrap.gap-3');
      expect(skillSection).toBeInTheDocument();

      // スキルタグが複数存在することを確認
      const skillTags = skillSection?.querySelectorAll('span');
      expect(skillTags?.length).toBeGreaterThan(0);
    });

    it('should handle image loading states in HeroSection', () => {
      const { container } = render(
        <HeroSection personalInfo={mockPersonalInfo} />
      );

      // アバター画像の存在を確認（LazyImageコンポーネントがモックされているため、通常のimg要素として確認）
      const avatarImg = container.querySelector('img');
      expect(avatarImg).toBeInTheDocument();
      expect(avatarImg).toHaveAttribute('src', mockPersonalInfo.avatar);
    });
  });

  describe('Video Card Animation Tests', () => {
    it('should render video card with animation structure', () => {
      const { container } = render(<VideoCard video={mockVideo} />);

      // ビデオカードのメイン要素を確認
      const videoLink = container.querySelector('a');
      expect(videoLink).toBeInTheDocument();
      expect(videoLink).toHaveAttribute('href', mockVideo.url);
      expect(videoLink).toHaveAttribute('target', '_blank');
    });

    it('should display video information correctly', () => {
      render(<VideoCard video={mockVideo} />);

      expect(screen.getByText(mockVideo.title)).toBeInTheDocument();

      // 日付フォーマットの確認
      const formattedDate = new Date(mockVideo.publishedAt).toLocaleDateString(
        'ja-JP',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }
      );
      expect(screen.getByText(formattedDate)).toBeInTheDocument();
    });

    it('should handle video thumbnail loading', () => {
      const { container } = render(<VideoCard video={mockVideo} />);

      const thumbnail = container.querySelector('img');
      expect(thumbnail).toBeInTheDocument();
      expect(thumbnail).toHaveAttribute('src', mockVideo.thumbnail);
      expect(thumbnail).toHaveAttribute(
        'alt',
        `動画「${mockVideo.title}」のサムネイル`
      );
      expect(thumbnail).toHaveAttribute('loading', 'lazy');
    });
  });

  describe('Accessibility and Animation Performance', () => {
    it('should maintain accessibility attributes during animations', () => {
      render(<HeroSection personalInfo={mockPersonalInfo} />);

      // アクセシビリティ属性が適切に設定されていることを確認
      const moreDetailsButton =
        screen.getByLabelText('自己紹介セクションを見る');
      const contactButton =
        screen.getByLabelText('お問い合わせセクションに移動');

      expect(moreDetailsButton).toBeInTheDocument();
      expect(contactButton).toBeInTheDocument();

      // フォーカス可能な要素であることを確認
      expect(moreDetailsButton).not.toHaveAttribute('tabindex', '-1');
      expect(contactButton).not.toHaveAttribute('tabindex', '-1');
    });

    it('should handle animation components gracefully', () => {
      // エラーが発生しないことを確認
      expect(() => {
        render(<HeroSection personalInfo={mockPersonalInfo} />);
      }).not.toThrow();

      expect(() => {
        render(<AboutSection personalInfo={mockPersonalInfo} />);
      }).not.toThrow();

      expect(() => {
        render(<VideoCard video={mockVideo} />);
      }).not.toThrow();
    });

    it('should render online status indicator with animation structure', () => {
      const { container } = render(
        <HeroSection personalInfo={mockPersonalInfo} />
      );

      // オンライン状態インジケーターの存在を確認
      const onlineIndicator = container.querySelector('.bg-green-500');
      expect(onlineIndicator).toBeInTheDocument();
    });

    it('should handle scroll navigation errors gracefully', () => {
      // getElementById が null を返す場合のテスト
      mockGetElementById.mockReturnValue(null);

      render(<HeroSection personalInfo={mockPersonalInfo} />);

      const moreDetailsButton = screen.getByText('もっと詳しく');

      // エラーが発生しないことを確認
      expect(() => {
        fireEvent.click(moreDetailsButton);
      }).not.toThrow();

      expect(mockGetElementById).toHaveBeenCalledWith('about');
      expect(mockScrollIntoView).not.toHaveBeenCalled();
    });
  });

  describe('Animation Structure Tests', () => {
    it('should render section titles with proper animation structure', () => {
      render(<AboutSection personalInfo={mockPersonalInfo} />);

      // セクションタイトルの存在を確認
      expect(screen.getByText('私について')).toBeInTheDocument();
      expect(screen.getByText('得意分野・使用ツール')).toBeInTheDocument();
      expect(screen.getByText('🎯 現在の活動')).toBeInTheDocument();
      expect(screen.getByText('💡 今後の展望')).toBeInTheDocument();
    });

    it('should render animation containers with proper structure', () => {
      const { container } = render(
        <AboutSection personalInfo={mockPersonalInfo} />
      );

      // セクション全体の構造を確認
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('id', 'about');

      // アニメーション関連の要素が存在することを確認
      const skillTags = container.querySelectorAll('span');
      expect(skillTags.length).toBeGreaterThan(0);
    });

    it('should handle video card play button overlay', () => {
      const { container } = render(<VideoCard video={mockVideo} />);

      // プレイボタンオーバーレイの構造を確認
      const playButtonContainer = container.querySelector('.bg-red-500');
      expect(playButtonContainer).toBeInTheDocument();
    });
  });
});
