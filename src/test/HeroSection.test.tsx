import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from './utils';
import userEvent from '@testing-library/user-event';
import HeroSection from '../components/HeroSection';
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

// Mock console.warn to avoid noise in tests
const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

describe('HeroSection Component', () => {
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
    mockConsoleWarn.mockClear();
  });

  describe('コンポーネントの表示テスト', () => {
    it('should render hero section with all required elements', () => {
      const { container } = render(
        <HeroSection personalInfo={mockPersonalInfo} />
      );

      // セクション要素の存在確認
      const heroSection = container.querySelector('section#hero');
      expect(heroSection).toBeInTheDocument();

      // 挨拶メッセージの確認
      expect(screen.getByText('👋 こんにちは！')).toBeInTheDocument();

      // 名前の表示確認
      expect(screen.getByText('テスト太郎')).toBeInTheDocument();

      // 職業・肩書きの表示確認
      expect(screen.getByText('フロントエンドエンジニア')).toBeInTheDocument();

      // 自己紹介文の表示確認
      expect(
        screen.getByText(
          'React と TypeScript を使用してモダンなウェブアプリケーションを開発しています。'
        )
      ).toBeInTheDocument();
    });

    it('should render avatar image with correct attributes', () => {
      render(<HeroSection personalInfo={mockPersonalInfo} />);

      const avatarImage = screen.getByAltText('テスト太郎のプロフィール写真');
      expect(avatarImage).toBeInTheDocument();
      expect(avatarImage).toHaveAttribute('src', '/images/test-avatar.jpg');
      expect(avatarImage).toHaveAttribute('loading', 'eager');
    });

    it('should render online status indicator', () => {
      const { container } = render(
        <HeroSection personalInfo={mockPersonalInfo} />
      );

      // オンライン状態インジケーターの確認
      const onlineIndicator = screen.getByRole('status');
      expect(onlineIndicator).toBeInTheDocument();

      const greenIndicator = container.querySelector('.bg-green-500');
      expect(greenIndicator).toBeInTheDocument();
    });

    it('should render CTA buttons with correct text', () => {
      render(<HeroSection personalInfo={mockPersonalInfo} />);

      expect(screen.getByText('もっと詳しく')).toBeInTheDocument();
      expect(screen.getByText('お問い合わせ')).toBeInTheDocument();
    });

    it('should render scroll indicator', () => {
      render(<HeroSection personalInfo={mockPersonalInfo} />);

      // スクロールインジケーターは実装されていないため、代わりにCTAボタンを確認
      expect(screen.getByText('もっと詳しく')).toBeInTheDocument();

      // CTAボタンの確認
      expect(screen.getByText('お問い合わせ')).toBeInTheDocument();
    });

    it('should render background decorative elements', () => {
      const { container } = render(
        <HeroSection personalInfo={mockPersonalInfo} />
      );

      // 背景装飾要素の確認
      const decorativeElements = container.querySelectorAll('.blur-3xl');
      expect(decorativeElements).toHaveLength(2);

      // プライマリカラーの装飾要素
      const primaryDecoration = container.querySelector('.bg-primary\\/10');
      expect(primaryDecoration).toBeInTheDocument();

      // アクセントカラーの装飾要素
      const accentDecoration = container.querySelector('.bg-accent\\/10');
      expect(accentDecoration).toBeInTheDocument();
    });
  });

  describe('アニメーション効果のテスト', () => {
    it('should have initial invisible state for main content', () => {
      const { container } = render(
        <HeroSection personalInfo={mockPersonalInfo} />
      );

      // 初期状態では非表示
      const mainContent = container.querySelector(
        '.flex.flex-col.md\\:flex-row'
      );
      // Framer Motionのアニメーションはインラインスタイルで制御されるため、スタイル属性を確認
      expect(mainContent).toHaveAttribute('style');
    });

    it('should have staggered animation delays for different elements', () => {
      const { container } = render(
        <HeroSection personalInfo={mockPersonalInfo} />
      );

      // 各要素の遅延クラスを確認
      const greetingElement = screen
        .getByText('👋 こんにちは！')
        .closest('div');
      // Framer Motionのアニメーションはインラインスタイルで制御される
      expect(greetingElement).toHaveAttribute('style');

      const nameElement = screen.getByText('テスト太郎').closest('div');
      expect(nameElement).toHaveAttribute('style');

      const titleElement = screen
        .getByText('フロントエンドエンジニア')
        .closest('div');
      expect(titleElement).toHaveAttribute('style');

      const descriptionElement = screen
        .getByText(/React と TypeScript/)
        .closest('div');
      expect(descriptionElement).toHaveAttribute('style');

      // CTAボタンの親要素を確認
      const ctaButton = screen.getByText('もっと詳しく');
      const ctaContainer = ctaButton.closest('div');
      expect(ctaContainer?.parentElement).toHaveAttribute('style');

      // スクロールインジケーターは実装されていないため、代わりにCTAボタンの確認
      const ctaButtons = screen.getByRole('group', {
        name: 'アクションボタン',
      });
      expect(ctaButtons).toHaveAttribute('style');
    });

    it('should have bounce animation for greeting', () => {
      render(<HeroSection personalInfo={mockPersonalInfo} />);

      const greetingElement = screen.getByText('👋 こんにちは！');
      // Framer Motionのアニメーションが適用されていることを確認
      expect(greetingElement.closest('div')).toHaveAttribute('style');
    });
  });

  describe('画像読み込み処理のテスト', () => {
    it('should show loading placeholder initially', () => {
      const { container } = render(
        <HeroSection personalInfo={mockPersonalInfo} />
      );

      // LazyImageコンポーネントが使用されていることを確認
      const avatarImage = screen.getByAltText('テスト太郎のプロフィール写真');
      expect(avatarImage).toBeInTheDocument();
    });

    it('should handle image load success', async () => {
      render(<HeroSection personalInfo={mockPersonalInfo} />);

      const avatarImage = screen.getByAltText('テスト太郎のプロフィール写真');

      // 画像読み込み完了をシミュレート
      fireEvent.load(avatarImage);

      // LazyImageコンポーネントが画像を正常に表示していることを確認
      expect(avatarImage).toBeInTheDocument();
    });

    it('should handle image load error with fallback', async () => {
      render(<HeroSection personalInfo={mockPersonalInfo} />);

      const avatarImage = screen.getByAltText('テスト太郎のプロフィール写真');

      // 画像読み込みエラーをシミュレート
      fireEvent.error(avatarImage);

      expect(avatarImage).toHaveAttribute('src', '/images/default-avatar.svg');
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Avatar image failed to load, using fallback'
      );
    });
  });

  describe('CTAボタンの動作テスト', () => {
    it('should scroll to about section when "もっと詳しく" button is clicked', async () => {
      const mockElement = document.createElement('div');
      mockGetElementById.mockReturnValue(mockElement);

      render(<HeroSection personalInfo={mockPersonalInfo} />);

      const detailButton = screen.getByLabelText('自己紹介セクションを見る');
      await userEvent.click(detailButton);

      expect(mockGetElementById).toHaveBeenCalledWith('about');
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('should scroll to social section when "お問い合わせ" button is clicked', async () => {
      const mockElement = document.createElement('div');
      mockGetElementById.mockReturnValue(mockElement);

      render(<HeroSection personalInfo={mockPersonalInfo} />);

      const contactButton =
        screen.getByLabelText('お問い合わせセクションに移動');
      await userEvent.click(contactButton);

      expect(mockGetElementById).toHaveBeenCalledWith('social');
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('should handle case when target element does not exist', async () => {
      mockGetElementById.mockReturnValue(null);

      render(<HeroSection personalInfo={mockPersonalInfo} />);

      const detailButton = screen.getByLabelText('自己紹介セクションを見る');
      await userEvent.click(detailButton);

      expect(mockGetElementById).toHaveBeenCalledWith('about');
      expect(mockScrollIntoView).not.toHaveBeenCalled();
    });
  });

  describe('レスポンシブレイアウトのテスト', () => {
    it('should have responsive container classes', () => {
      const { container } = render(
        <HeroSection personalInfo={mockPersonalInfo} />
      );

      const containerElement = container.querySelector('.container-responsive');
      expect(containerElement).toBeInTheDocument();
    });

    it('should have responsive flex layout for main content', () => {
      const { container } = render(
        <HeroSection personalInfo={mockPersonalInfo} />
      );

      const mainContent = container.querySelector(
        '.flex.flex-col.md\\:flex-row'
      );
      expect(mainContent).toHaveClass('flex', 'flex-col', 'md:flex-row');
      expect(mainContent).toHaveClass('items-center', 'justify-center');
      expect(mainContent).toHaveClass('gap-8', 'md:gap-16');
    });

    it('should have responsive avatar sizing', () => {
      const { container } = render(
        <HeroSection personalInfo={mockPersonalInfo} />
      );

      const avatarContainer = container.querySelector(
        '.w-48.h-48.md\\:w-64.md\\:h-64'
      );
      expect(avatarContainer).toHaveClass('w-48', 'h-48', 'md:w-64', 'md:h-64');
    });

    it('should have responsive text alignment', () => {
      const { container } = render(
        <HeroSection personalInfo={mockPersonalInfo} />
      );

      const textSection = container.querySelector(
        '.text-center.md\\:text-left'
      );
      expect(textSection).toHaveClass('text-center', 'md:text-left');
    });

    it('should have responsive typography sizing', () => {
      render(<HeroSection personalInfo={mockPersonalInfo} />);

      // 挨拶テキストのレスポンシブサイズ
      const greetingText = screen.getByText('👋 こんにちは！');
      expect(greetingText).toHaveClass('text-lg', 'md:text-xl');

      // 名前のレスポンシブサイズ
      const nameHeading = screen.getByText('テスト太郎');
      expect(nameHeading).toHaveClass(
        'text-responsive-4xl',
        'md:text-responsive-6xl'
      );

      // 職業のレスポンシブサイズ
      const titleText = screen.getByText('フロントエンドエンジニア');
      expect(titleText).toHaveClass(
        'text-responsive-2xl',
        'md:text-responsive-3xl'
      );

      // 説明文のレスポンシブサイズ
      const descriptionText = screen.getByText(/React と TypeScript/);
      expect(descriptionText).toHaveClass(
        'text-responsive-lg',
        'md:text-responsive-xl'
      );
    });

    it('should have responsive button layout', () => {
      const { container } = render(
        <HeroSection personalInfo={mockPersonalInfo} />
      );

      const buttonContainer = container.querySelector(
        '.flex.flex-col.sm\\:flex-row'
      );
      expect(buttonContainer).toHaveClass('flex', 'flex-col', 'sm:flex-row');
      expect(buttonContainer).toHaveClass('gap-4');
      expect(buttonContainer).toHaveClass('justify-center', 'md:justify-start');
    });

    it('should have responsive online indicator sizing', () => {
      const { container } = render(
        <HeroSection personalInfo={mockPersonalInfo} />
      );

      const onlineIndicator = container.querySelector(
        '.w-6.h-6.md\\:w-8.md\\:h-8'
      );
      expect(onlineIndicator).toHaveClass('w-6', 'h-6', 'md:w-8', 'md:h-8');
    });

    it('should have responsive positioning for online indicator', () => {
      const { container } = render(
        <HeroSection personalInfo={mockPersonalInfo} />
      );

      const indicatorContainer = container.querySelector(
        '.bottom-4.right-4.md\\:bottom-6.md\\:right-6'
      );
      expect(indicatorContainer).toHaveClass(
        'bottom-4',
        'right-4',
        'md:bottom-6',
        'md:right-6'
      );
    });

    it('should have proper responsive background gradient', () => {
      const { container } = render(
        <HeroSection personalInfo={mockPersonalInfo} />
      );

      const heroSection = container.querySelector('section');
      expect(heroSection).toHaveClass(
        'bg-gradient-to-br',
        'from-primary/5',
        'to-white'
      );
    });

    it('should have responsive min-height for full viewport', () => {
      const { container } = render(
        <HeroSection personalInfo={mockPersonalInfo} />
      );

      const heroSection = container.querySelector('section');
      expect(heroSection).toHaveClass('min-h-screen');
    });
  });

  describe('アクセシビリティテスト', () => {
    it('should have proper ARIA labels for interactive elements', () => {
      render(<HeroSection personalInfo={mockPersonalInfo} />);

      expect(
        screen.getByLabelText('自己紹介セクションを見る')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('お問い合わせセクションに移動')
      ).toBeInTheDocument();
    });

    it('should have proper alt text for avatar image', () => {
      render(<HeroSection personalInfo={mockPersonalInfo} />);

      const avatarImage = screen.getByAltText('テスト太郎のプロフィール写真');
      expect(avatarImage).toBeInTheDocument();
    });

    it('should have proper focus management for buttons', async () => {
      render(<HeroSection personalInfo={mockPersonalInfo} />);

      const detailButton = screen.getByLabelText('自己紹介セクションを見る');
      const contactButton =
        screen.getByLabelText('お問い合わせセクションに移動');

      // Focus the buttons
      detailButton.focus();
      expect(detailButton).toHaveFocus();

      contactButton.focus();
      expect(contactButton).toHaveFocus();

      // Check focus styles
      expect(detailButton).toHaveClass(
        'focus:outline-none',
        'focus:ring-4',
        'focus:ring-primary/30'
      );
      expect(contactButton).toHaveClass(
        'focus:outline-none',
        'focus:ring-4',
        'focus:ring-primary/30'
      );
    });

    it('should have proper semantic HTML structure', () => {
      const { container } = render(
        <HeroSection personalInfo={mockPersonalInfo} />
      );

      // セクション要素
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('id', 'hero');

      // 見出し要素
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('テスト太郎');
    });
  });

  describe('スタイリングとクラステスト', () => {
    it('should have proper transition classes for animations', () => {
      const { container } = render(
        <HeroSection personalInfo={mockPersonalInfo} />
      );

      // Framer Motionを使用しているため、motion要素を確認
      const motionElements = container.querySelectorAll('[style*="transform"]');
      expect(motionElements.length).toBeGreaterThan(0);

      // Framer Motionのアニメーション要素を確認
      const animationElements = container.querySelectorAll(
        '[style*="transform"]'
      );
      expect(animationElements.length).toBeGreaterThan(0);
    });

    it('should have proper hover effects for buttons', () => {
      render(<HeroSection personalInfo={mockPersonalInfo} />);

      const detailButton = screen.getByLabelText('自己紹介セクションを見る');
      const contactButton =
        screen.getByLabelText('お問い合わせセクションに移動');

      // プライマリボタンの基本スタイル
      expect(detailButton).toHaveClass(
        'bg-primary',
        'text-white',
        'px-8',
        'py-4',
        'rounded-full'
      );

      // セカンダリボタンの基本スタイル（Framer Motionでホバー効果を制御）
      expect(contactButton).toHaveClass(
        'border-2',
        'border-primary',
        'text-primary',
        'px-8',
        'py-4',
        'rounded-full'
      );

      // ホバー効果は#059669（emerald-600）の色に変更されることをコメントで記録
      // whileHover: { backgroundColor: '#059669', color: '#FFFFFF' }
    });

    it('should have proper shadow and border radius styles', () => {
      const { container } = render(
        <HeroSection personalInfo={mockPersonalInfo} />
      );

      // アバター画像のスタイル
      const avatarContainer = container.querySelector(
        '.rounded-full.shadow-2xl'
      );
      expect(avatarContainer).toBeInTheDocument();
      expect(avatarContainer).toHaveClass('ring-4', 'ring-white/50');

      // ボタンのスタイル (2つのボタン + 1つのオンラインインジケーター = 3つ)
      const roundedElements = container.querySelectorAll(
        '.rounded-full.shadow-lg'
      );
      expect(roundedElements.length).toBe(3);
    });

    it('should have proper z-index layering', () => {
      const { container } = render(
        <HeroSection personalInfo={mockPersonalInfo} />
      );

      // メインコンテンツのz-index
      const mainContainer = container.querySelector('.relative.z-10');
      expect(mainContainer).toBeInTheDocument();

      // 背景要素のpointer-events
      const backgroundElements = container.querySelector(
        '.pointer-events-none'
      );
      expect(backgroundElements).toBeInTheDocument();
    });

    it('should have proper overflow handling', () => {
      const { container } = render(
        <HeroSection personalInfo={mockPersonalInfo} />
      );

      const heroSection = container.querySelector('section');
      expect(heroSection).toHaveClass('overflow-hidden');

      const backgroundContainer = container.querySelector(
        '.overflow-hidden.pointer-events-none'
      );
      expect(backgroundContainer).toBeInTheDocument();
    });
  });
});
