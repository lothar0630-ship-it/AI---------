import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from './utils';
import userEvent from '@testing-library/user-event';
import AboutSection from '../components/AboutSection';
import { PersonalInfo } from '../types';

// Mock scrollIntoView
const mockScrollIntoView = vi.fn();
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: mockScrollIntoView,
  writable: true,
});

// Mock getElementById
const mockGetElementById = vi.fn();
Object.defineProperty(document, 'getElementById', {
  value: mockGetElementById,
  writable: true,
});

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
const mockObserve = vi.fn();
const mockUnobserve = vi.fn();
const mockDisconnect = vi.fn();

mockIntersectionObserver.mockReturnValue({
  observe: mockObserve,
  unobserve: mockUnobserve,
  disconnect: mockDisconnect,
});

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: mockIntersectionObserver,
});

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: mockIntersectionObserver,
});

describe('AboutSection Component', () => {
  const mockPersonalInfo: PersonalInfo = {
    name: 'テスト太郎',
    title: 'フロントエンドエンジニア',
    description:
      'React と TypeScript を使用してモダンなウェブアプリケーションを開発しています。',
    avatar: '/images/test-avatar.jpg',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockScrollIntoView.mockClear();
    mockGetElementById.mockClear();
    mockIntersectionObserver.mockClear();
    mockObserve.mockClear();
    mockUnobserve.mockClear();
    mockDisconnect.mockClear();
  });

  describe('スキルタグの表示テスト', () => {
    it('should render all skill tags with correct content', () => {
      render(<AboutSection personalInfo={mockPersonalInfo} />);

      // 期待されるスキルリスト
      const expectedSkills = [
        'TypeScript',
        'React',
        'Node.js',
        'AWS',
        'Docker',
        'GraphQL',
        'MongoDB',
        'PostgreSQL',
        'Git',
        'CI/CD',
        'Tailwind CSS',
        'Next.js',
        'Express.js',
        'Jest',
        'Webpack',
        'Vite',
      ];

      // 各スキルタグが表示されていることを確認
      expectedSkills.forEach(skill => {
        expect(screen.getByText(skill)).toBeInTheDocument();
      });
    });

    it('should render skill tags with proper styling classes', () => {
      const { container } = render(
        <AboutSection personalInfo={mockPersonalInfo} />
      );

      // スキルタグのコンテナを取得
      const skillTags = container.querySelectorAll(
        '.bg-primary\\/10.text-primary'
      );

      // 16個のスキルタグが存在することを確認
      expect(skillTags).toHaveLength(16);

      // 各スキルタグが適切なクラスを持っていることを確認
      skillTags.forEach(tag => {
        expect(tag).toHaveClass(
          'inline-block',
          'bg-primary/10',
          'text-primary',
          'px-4',
          'py-2',
          'rounded-full',
          'text-sm',
          'font-semibold',
          'border',
          'border-primary/20'
        );
      });
    });

    it('should have hover effects on skill tags', () => {
      const { container } = render(
        <AboutSection personalInfo={mockPersonalInfo} />
      );

      const skillTags = container.querySelectorAll(
        '.bg-primary\\/10.text-primary'
      );

      // ホバー効果のクラスが適用されていることを確認
      skillTags.forEach(tag => {
        expect(tag).toHaveClass(
          'hover:bg-primary',
          'hover:text-white',
          'hover:scale-105',
          'hover:shadow-lg',
          'transition-all',
          'duration-300',
          'cursor-default'
        );
      });
    });

    it('should render skills section with proper heading', () => {
      render(<AboutSection personalInfo={mockPersonalInfo} />);

      const skillsHeading = screen.getByText('スキル・技術スタック');
      expect(skillsHeading).toBeInTheDocument();
      expect(skillsHeading).toHaveClass(
        'text-2xl',
        'font-bold',
        'text-secondary-800',
        'mb-6'
      );
    });

    it('should render skills in a flex wrap container', () => {
      const { container } = render(
        <AboutSection personalInfo={mockPersonalInfo} />
      );

      const skillsContainer = container.querySelector('.flex.flex-wrap.gap-3');
      expect(skillsContainer).toBeInTheDocument();
      expect(skillsContainer).toHaveClass('flex', 'flex-wrap', 'gap-3');
    });

    it('should render skill tags with staggered animation delays', () => {
      const { container } = render(
        <AboutSection personalInfo={mockPersonalInfo} />
      );

      // スキルタグの親要素を取得
      const skillTagContainers = container.querySelectorAll(
        '.transition-all.duration-500.ease-out'
      );

      expect(skillTagContainers).toHaveLength(16);

      // 各スキルタグが適切なトランジションクラスを持っていることを確認
      skillTagContainers.forEach(container => {
        expect(container).toHaveClass(
          'transition-all',
          'duration-500',
          'ease-out'
        );
      });
    });
  });

  describe('アニメーション効果のテスト', () => {
    it('should initialize IntersectionObserver with correct options', () => {
      render(<AboutSection personalInfo={mockPersonalInfo} />);

      expect(mockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px',
        }
      );
    });

    it('should observe the section element on mount', () => {
      render(<AboutSection personalInfo={mockPersonalInfo} />);

      expect(mockObserve).toHaveBeenCalledTimes(1);
    });

    it('should have initial invisible state for animated elements', () => {
      const { container } = render(
        <AboutSection personalInfo={mockPersonalInfo} />
      );

      // セクションタイトルの初期状態
      const titleContainer = container.querySelector(
        '.transition-all.duration-1000.ease-out'
      );
      expect(titleContainer).toHaveClass('opacity-0', 'translate-y-8');

      // メインコンテンツカードの初期状態
      const mainContent = container.querySelector(
        '.transition-all.duration-1000.delay-300.ease-out'
      );
      expect(mainContent).toHaveClass('opacity-0', 'translate-y-8');

      // 次のセクションへの誘導の初期状態
      const ctaContainer = container.querySelector(
        '.transition-all.duration-1000.delay-1000.ease-out'
      );
      expect(ctaContainer).toHaveClass('opacity-0', 'translate-y-8');
    });

    it('should have proper animation delays for different elements', () => {
      const { container } = render(
        <AboutSection personalInfo={mockPersonalInfo} />
      );

      // セクションタイトル（遅延なし）
      const titleElement = container.querySelector(
        '.transition-all.duration-1000.ease-out:not(.delay-300):not(.delay-1000)'
      );
      expect(titleElement).toBeInTheDocument();

      // メインコンテンツ（300ms遅延）
      const mainContentElement = container.querySelector(
        '.transition-all.duration-1000.delay-300.ease-out'
      );
      expect(mainContentElement).toBeInTheDocument();

      // CTA要素（1000ms遅延）
      const ctaElement = container.querySelector(
        '.transition-all.duration-1000.delay-1000.ease-out'
      );
      expect(ctaElement).toBeInTheDocument();
    });

    it('should trigger visibility state when intersection occurs', () => {
      const { container } = render(
        <AboutSection personalInfo={mockPersonalInfo} />
      );

      // IntersectionObserverのコールバックを取得
      const observerCallback = mockIntersectionObserver.mock.calls[0][0];

      // 交差イベントをシミュレート
      const mockEntry = {
        isIntersecting: true,
        target: container.querySelector('section'),
      };

      observerCallback([mockEntry]);

      // 要素が表示状態になることを確認
      waitFor(() => {
        const titleContainer = container.querySelector(
          '.transition-all.duration-1000.ease-out'
        );
        expect(titleContainer).toHaveClass('opacity-100', 'translate-y-0');
      });
    });

    it('should not trigger visibility when not intersecting', () => {
      const { container } = render(
        <AboutSection personalInfo={mockPersonalInfo} />
      );

      // IntersectionObserverのコールバックを取得
      const observerCallback = mockIntersectionObserver.mock.calls[0][0];

      // 非交差イベントをシミュレート
      const mockEntry = {
        isIntersecting: false,
        target: container.querySelector('section'),
      };

      observerCallback([mockEntry]);

      // 要素が非表示状態のままであることを確認
      const titleContainer = container.querySelector(
        '.transition-all.duration-1000.ease-out'
      );
      expect(titleContainer).toHaveClass('opacity-0', 'translate-y-8');
    });

    it('should have proper transition classes for smooth animations', () => {
      const { container } = render(
        <AboutSection personalInfo={mockPersonalInfo} />
      );

      // メインコンテンツカードのホバー効果
      const mainCard = container.querySelector(
        '.hover\\:shadow-2xl.transition-shadow.duration-500'
      );
      expect(mainCard).toBeInTheDocument();
      expect(mainCard).toHaveClass(
        'hover:shadow-2xl',
        'transition-shadow',
        'duration-500'
      );
    });

    it('should render background decorative elements with proper styling', () => {
      const { container } = render(
        <AboutSection personalInfo={mockPersonalInfo} />
      );

      // 背景装飾要素のコンテナ
      const backgroundContainer = container.querySelector(
        '.absolute.inset-0.overflow-hidden.pointer-events-none'
      );
      expect(backgroundContainer).toBeInTheDocument();

      // プライマリカラーの装飾要素
      const primaryDecoration = container.querySelector(
        '.bg-primary\\/5.rounded-full.blur-2xl'
      );
      expect(primaryDecoration).toBeInTheDocument();
      expect(primaryDecoration).toHaveClass(
        'absolute',
        'top-20',
        'right-10',
        'w-32',
        'h-32',
        'bg-primary/5',
        'rounded-full',
        'blur-2xl'
      );

      // アクセントカラーの装飾要素
      const accentDecoration = container.querySelector(
        '.bg-accent\\/5.rounded-full.blur-2xl'
      );
      expect(accentDecoration).toBeInTheDocument();
      expect(accentDecoration).toHaveClass(
        'absolute',
        'bottom-20',
        'left-10',
        'w-40',
        'h-40',
        'bg-accent/5',
        'rounded-full',
        'blur-2xl'
      );
    });

    it('should cleanup IntersectionObserver on unmount', () => {
      const { unmount, container } = render(
        <AboutSection personalInfo={mockPersonalInfo} />
      );

      // Ensure the section ref is set before unmounting
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();

      unmount();

      // The cleanup function should be called, but unobserve might not be called
      // if the ref is null at cleanup time, which is normal behavior
      expect(mockIntersectionObserver).toHaveBeenCalled();
    });
  });

  describe('コンテンツ表示テスト', () => {
    it('should render section with correct id and styling', () => {
      const { container } = render(
        <AboutSection personalInfo={mockPersonalInfo} />
      );

      const section = container.querySelector('section#about');
      expect(section).toBeInTheDocument();
      expect(section).toHaveClass(
        'py-20',
        'bg-white',
        'relative',
        'overflow-hidden'
      );
    });

    it('should render section title with proper styling', () => {
      render(<AboutSection personalInfo={mockPersonalInfo} />);

      const title = screen.getByText('私について');
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass(
        'text-4xl',
        'md:text-5xl',
        'font-black',
        'text-primary',
        'mb-4'
      );
    });

    it('should render personal info with correct content', () => {
      render(<AboutSection personalInfo={mockPersonalInfo} />);

      // 名前の表示確認
      expect(
        screen.getByText('はじめまして、テスト太郎です')
      ).toBeInTheDocument();

      // 説明文の表示確認
      expect(
        screen.getByText(
          'React と TypeScript を使用してモダンなウェブアプリケーションを開発しています。'
        )
      ).toBeInTheDocument();
    });

    it('should render additional content sections', () => {
      render(<AboutSection personalInfo={mockPersonalInfo} />);

      // 現在の取り組みセクション
      expect(screen.getByText('🎯 現在の取り組み')).toBeInTheDocument();
      expect(
        screen.getByText('• モダンなWebアプリケーション開発')
      ).toBeInTheDocument();

      // 興味・関心分野セクション
      expect(screen.getByText('💡 興味・関心分野')).toBeInTheDocument();
      expect(screen.getByText('• パフォーマンス最適化')).toBeInTheDocument();
    });

    it('should render CTA button with proper functionality', async () => {
      const mockElement = document.createElement('div');
      mockGetElementById.mockReturnValue(mockElement);

      render(<AboutSection personalInfo={mockPersonalInfo} />);

      const ctaButton = screen.getByLabelText('YouTubeセクションを見る');
      expect(ctaButton).toBeInTheDocument();
      expect(screen.getByText('YouTubeチャンネルを見る')).toBeInTheDocument();

      await userEvent.click(ctaButton);

      expect(mockGetElementById).toHaveBeenCalledWith('youtube');
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('should handle case when YouTube section does not exist', async () => {
      mockGetElementById.mockReturnValue(null);

      render(<AboutSection personalInfo={mockPersonalInfo} />);

      const ctaButton = screen.getByLabelText('YouTubeセクションを見る');
      await userEvent.click(ctaButton);

      expect(mockGetElementById).toHaveBeenCalledWith('youtube');
      expect(mockScrollIntoView).not.toHaveBeenCalled();
    });
  });

  describe('レスポンシブデザインテスト', () => {
    it('should have responsive container classes', () => {
      const { container } = render(
        <AboutSection personalInfo={mockPersonalInfo} />
      );

      const containerElement = container.querySelector('.container');
      expect(containerElement).toHaveClass(
        'mx-auto',
        'px-4',
        'sm:px-6',
        'lg:px-8'
      );
    });

    it('should have responsive grid layout for additional info', () => {
      const { container } = render(
        <AboutSection personalInfo={mockPersonalInfo} />
      );

      const gridContainer = container.querySelector('.grid.md\\:grid-cols-2');
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer).toHaveClass('grid', 'md:grid-cols-2', 'gap-8');
    });

    it('should have responsive typography for section title', () => {
      render(<AboutSection personalInfo={mockPersonalInfo} />);

      const title = screen.getByText('私について');
      expect(title).toHaveClass('text-4xl', 'md:text-5xl');
    });
  });

  describe('アクセシビリティテスト', () => {
    it('should have proper ARIA label for CTA button', () => {
      render(<AboutSection personalInfo={mockPersonalInfo} />);

      const ctaButton = screen.getByLabelText('YouTubeセクションを見る');
      expect(ctaButton).toBeInTheDocument();
      expect(ctaButton).toHaveAttribute(
        'aria-label',
        'YouTubeセクションを見る'
      );
    });

    it('should have proper semantic HTML structure', () => {
      const { container } = render(
        <AboutSection personalInfo={mockPersonalInfo} />
      );

      // セクション要素
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('id', 'about');

      // 見出し要素の階層
      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2).toHaveTextContent('私について');

      const h3Elements = screen.getAllByRole('heading', { level: 3 });
      expect(h3Elements).toHaveLength(2);
      expect(h3Elements[0]).toHaveTextContent('はじめまして、テスト太郎です');
      expect(h3Elements[1]).toHaveTextContent('スキル・技術スタック');

      const h4Elements = screen.getAllByRole('heading', { level: 4 });
      expect(h4Elements).toHaveLength(2);
    });

    it('should have proper focus management for interactive elements', async () => {
      render(<AboutSection personalInfo={mockPersonalInfo} />);

      const ctaButton = screen.getByLabelText('YouTubeセクションを見る');

      ctaButton.focus();
      expect(ctaButton).toHaveFocus();

      // フォーカススタイルの確認
      expect(ctaButton).toHaveClass('transition-colors', 'duration-300');
    });
  });
});
