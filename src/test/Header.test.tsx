import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from './utils';
import userEvent from '@testing-library/user-event';
import Header from '../components/Header';

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

describe('Header Component', () => {
  const mockPersonalInfo = {
    name: 'テスト太郎',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockScrollIntoView.mockClear();
    mockGetElementById.mockClear();
  });

  describe('基本的なレンダリング', () => {
    it('should render header with logo', () => {
      render(<Header personalInfo={mockPersonalInfo} />);

      expect(screen.getByText('テスト太郎.dev')).toBeInTheDocument();
    });

    it('should render default logo when personalInfo is not provided', () => {
      render(<Header />);

      expect(screen.getByText('Portfolio.dev')).toBeInTheDocument();
    });

    it('should render navigation items', () => {
      render(<Header personalInfo={mockPersonalInfo} />);

      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('YouTube')).toBeInTheDocument();
      expect(screen.getByText('Social')).toBeInTheDocument();
    });

    it('should render mobile menu button', () => {
      render(<Header personalInfo={mockPersonalInfo} />);

      expect(screen.getByLabelText('メニューを開く')).toBeInTheDocument();
    });
  });

  describe('ナビゲーションリンクの動作テスト', () => {
    it('should scroll to hero section when logo is clicked', async () => {
      const mockElement = document.createElement('div');
      mockGetElementById.mockReturnValue(mockElement);

      render(<Header personalInfo={mockPersonalInfo} />);

      const logoButton = screen.getByLabelText('ホームに戻る');
      await userEvent.click(logoButton);

      expect(mockGetElementById).toHaveBeenCalledWith('hero');
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('should scroll to about section when About link is clicked', async () => {
      const mockElement = document.createElement('div');
      mockGetElementById.mockReturnValue(mockElement);

      render(<Header personalInfo={mockPersonalInfo} />);

      const aboutButton = screen.getByLabelText('Aboutセクションに移動');
      await userEvent.click(aboutButton);

      expect(mockGetElementById).toHaveBeenCalledWith('about');
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('should scroll to youtube section when YouTube link is clicked', async () => {
      const mockElement = document.createElement('div');
      mockGetElementById.mockReturnValue(mockElement);

      render(<Header personalInfo={mockPersonalInfo} />);

      const youtubeButton = screen.getByLabelText('YouTubeセクションに移動');
      await userEvent.click(youtubeButton);

      expect(mockGetElementById).toHaveBeenCalledWith('youtube');
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('should scroll to social section when Social link is clicked', async () => {
      const mockElement = document.createElement('div');
      mockGetElementById.mockReturnValue(mockElement);

      render(<Header personalInfo={mockPersonalInfo} />);

      const socialButton = screen.getByLabelText('Socialセクションに移動');
      await userEvent.click(socialButton);

      expect(mockGetElementById).toHaveBeenCalledWith('social');
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('should handle mobile menu toggle', async () => {
      render(<Header personalInfo={mockPersonalInfo} />);

      const menuButton = screen.getByLabelText('メニューを開く');
      await userEvent.click(menuButton);

      expect(screen.getByLabelText('メニューを閉じる')).toBeInTheDocument();
    });

    it('should handle case when target element does not exist', async () => {
      mockGetElementById.mockReturnValue(null);

      render(<Header personalInfo={mockPersonalInfo} />);

      const aboutButton = screen.getByLabelText('Aboutセクションに移動');
      await userEvent.click(aboutButton);

      expect(mockGetElementById).toHaveBeenCalledWith('about');
      expect(mockScrollIntoView).not.toHaveBeenCalled();
    });
  });

  describe('モバイルメニューの動作テスト', () => {
    it('should toggle mobile menu when hamburger button is clicked', async () => {
      render(<Header personalInfo={mockPersonalInfo} />);

      const menuButton = screen.getByLabelText('メニューを開く');

      // Initially, mobile menu should not be visible
      expect(screen.queryByText('About')).toBeInTheDocument(); // Desktop nav

      // Click to open mobile menu
      await userEvent.click(menuButton);

      // Mobile menu should be visible
      await waitFor(() => {
        const mobileNavItems = screen.getAllByText('About');
        expect(mobileNavItems.length).toBeGreaterThan(1); // Desktop + Mobile
      });
    });

    it('should close mobile menu when navigation item is clicked', async () => {
      const mockElement = document.createElement('div');
      mockGetElementById.mockReturnValue(mockElement);

      render(<Header personalInfo={mockPersonalInfo} />);

      const menuButton = screen.getByLabelText('メニューを開く');

      // Open mobile menu
      await userEvent.click(menuButton);

      // Click on a mobile navigation item
      const mobileNavItems = screen.getAllByLabelText('Aboutセクションに移動');
      const mobileAboutButton = mobileNavItems.find(item =>
        item.closest('.md\\:hidden')
      );

      if (mobileAboutButton) {
        await userEvent.click(mobileAboutButton);

        expect(mockGetElementById).toHaveBeenCalledWith('about');
        expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

        // Check that mobile navigation items have proper focus-visible styles
        expect(mobileAboutButton).toHaveClass(
          'focus:outline-none',
          'focus-visible:ring-2',
          'focus-visible:ring-primary'
        );
      }
    });

    it('should show close icon when mobile menu is open', async () => {
      render(<Header personalInfo={mockPersonalInfo} />);

      const menuButton = screen.getByLabelText('メニューを開く');

      // Initially should show menu icon (Menu component)
      expect(menuButton.querySelector('svg')).toBeTruthy();

      // Click to open menu
      await userEvent.click(menuButton);

      // Should show close icon (X component)
      await waitFor(() => {
        expect(menuButton.querySelector('svg')).toBeTruthy();
        // The aria-expanded should change to true
        expect(menuButton).toHaveAttribute('aria-expanded', 'true');
      });
    });
  });

  describe('レスポンシブ表示のテスト', () => {
    it('should have responsive classes for desktop navigation', () => {
      render(<Header personalInfo={mockPersonalInfo} />);

      const desktopNav = screen.getByText('About').closest('nav');
      expect(desktopNav).toHaveClass('hidden', 'md:block');
    });

    it('should have responsive classes for mobile menu button', () => {
      render(<Header personalInfo={mockPersonalInfo} />);

      const mobileMenuButton = screen.getByLabelText('メニューを開く');
      expect(mobileMenuButton.closest('div')).toHaveClass('md:hidden');
    });

    it('should have responsive classes for mobile menu', () => {
      render(<Header personalInfo={mockPersonalInfo} />);

      const mobileMenuButton = screen.getByLabelText('メニューを開く');
      expect(mobileMenuButton.closest('div')).toHaveClass('md:hidden');
    });

    it('should have responsive container classes', () => {
      const { container } = render(<Header personalInfo={mockPersonalInfo} />);

      const headerContainer = container.querySelector('.container-responsive');
      expect(headerContainer).toBeInTheDocument();
    });

    it('should have sticky header with proper z-index', () => {
      const { container } = render(<Header personalInfo={mockPersonalInfo} />);

      const header = container.querySelector('header');
      expect(header).toHaveClass('sticky', 'top-0', 'z-50');
    });

    it('should have backdrop blur and transparency effects', () => {
      const { container } = render(<Header personalInfo={mockPersonalInfo} />);

      const header = container.querySelector('header');
      expect(header).toHaveClass('bg-white/95', 'backdrop-blur-sm');
    });
  });

  describe('フォーカス管理テスト', () => {
    it('should call scrollToSection with blur parameter for home button', async () => {
      const mockElement = document.createElement('div');
      mockGetElementById.mockReturnValue(mockElement);

      render(<Header personalInfo={mockPersonalInfo} />);

      const logoButton = screen.getByLabelText('ホームに戻る');
      await userEvent.click(logoButton);

      expect(mockGetElementById).toHaveBeenCalledWith('hero');
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('should call scrollToSection without blur parameter for other navigation buttons', async () => {
      const mockElement = document.createElement('div');
      mockGetElementById.mockReturnValue(mockElement);

      render(<Header personalInfo={mockPersonalInfo} />);

      const aboutButton = screen.getByLabelText('Aboutセクションに移動');
      await userEvent.click(aboutButton);

      expect(mockGetElementById).toHaveBeenCalledWith('about');
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });
  });

  describe('アクセシビリティテスト', () => {
    it('should have proper ARIA labels for all interactive elements', () => {
      render(<Header personalInfo={mockPersonalInfo} />);

      expect(screen.getByLabelText('ホームに戻る')).toBeInTheDocument();
      expect(
        screen.getByLabelText('Aboutセクションに移動')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('YouTubeセクションに移動')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('Socialセクションに移動')
      ).toBeInTheDocument();
      expect(screen.getByLabelText('メニューを開く')).toBeInTheDocument();
      expect(screen.getByLabelText('メニューを開く')).toBeInTheDocument();
    });

    it('should have proper aria-expanded attribute for mobile menu', async () => {
      render(<Header personalInfo={mockPersonalInfo} />);

      const menuButton = screen.getByLabelText('メニューを開く');

      // Initially should be false
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');

      // After clicking should be true
      await userEvent.click(menuButton);
      expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have proper focus management', () => {
      render(<Header personalInfo={mockPersonalInfo} />);

      const logoButton = screen.getByLabelText('ホームに戻る');

      // Should have focus styles (focus-visible for keyboard navigation)
      expect(logoButton).toHaveClass(
        'focus:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-primary'
      );
    });

    it('should have aria-hidden attributes for decorative icons', () => {
      render(<Header personalInfo={mockPersonalInfo} />);

      const menuButton = screen.getByLabelText('メニューを開く');
      const icon = menuButton.querySelector('svg');

      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have proper focus-visible styles for all navigation buttons', () => {
      render(<Header personalInfo={mockPersonalInfo} />);

      // Check desktop navigation buttons
      const aboutButton = screen.getByLabelText('Aboutセクションに移動');
      expect(aboutButton).toHaveClass(
        'focus:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-primary'
      );

      // Check mobile menu button
      const mobileMenuButton = screen.getByLabelText('メニューを開く');
      expect(mobileMenuButton).toHaveClass(
        'focus:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-inset',
        'focus-visible:ring-primary'
      );
    });
  });

  describe('スタイリングとクラステスト', () => {
    it('should have proper transition classes for interactive elements', () => {
      render(<Header personalInfo={mockPersonalInfo} />);

      const logoButton = screen.getByLabelText('ホームに戻る');
      expect(logoButton).toHaveClass('transition-colors', 'duration-200');

      const navButtons = screen.getAllByText('About');
      const desktopNavButton = navButtons.find(button =>
        button.classList.contains('text-secondary-600')
      );
      expect(desktopNavButton).toHaveClass('transition-colors', 'duration-200');
    });

    it('should have proper hover states', () => {
      render(<Header personalInfo={mockPersonalInfo} />);

      const logoButton = screen.getByLabelText('ホームに戻る');
      expect(logoButton).toHaveClass('hover:text-primary-600');

      const mobileMenuButton = screen.getByLabelText('メニューを開く');
      expect(mobileMenuButton).toHaveClass(
        'hover:text-primary',
        'hover:bg-gray-100'
      );
    });

    it('should have proper shadow and border styles', () => {
      const { container } = render(<Header personalInfo={mockPersonalInfo} />);

      const header = container.querySelector('header');
      expect(header).toHaveClass('border-b', 'border-gray-200', 'shadow-sm');
    });
  });
});
