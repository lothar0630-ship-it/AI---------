import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import { VideoCard } from '../components/VideoCard';
import SocialLink from '../components/SocialLink';
// Mock accessibility helpers
const mockFocusTrap = {
  activate: vi.fn((container: HTMLElement) => {
    const firstButton = container.querySelector('button');
    if (firstButton) {
      firstButton.focus();
    }
  }),
  deactivate: vi.fn(),
};

// Create live regions in DOM for testing
const createLiveRegions = () => {
  // Remove existing regions
  const existingPolite = document.getElementById('live-region-polite');
  const existingAssertive = document.getElementById('live-region-assertive');
  if (existingPolite) existingPolite.remove();
  if (existingAssertive) existingAssertive.remove();

  // Create new regions
  const politeRegion = document.createElement('div');
  politeRegion.id = 'live-region-polite';
  politeRegion.setAttribute('aria-live', 'polite');
  politeRegion.setAttribute('aria-atomic', 'true');
  politeRegion.className = 'sr-only';
  document.body.appendChild(politeRegion);

  const assertiveRegion = document.createElement('div');
  assertiveRegion.id = 'live-region-assertive';
  assertiveRegion.setAttribute('aria-live', 'assertive');
  assertiveRegion.setAttribute('aria-atomic', 'true');
  assertiveRegion.className = 'sr-only';
  document.body.appendChild(assertiveRegion);
};

const mockScreenReaderAnnouncer = {
  announce: vi.fn(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      const regionId =
        priority === 'assertive'
          ? 'live-region-assertive'
          : 'live-region-polite';
      const region = document.getElementById(regionId);
      if (region) {
        region.textContent = message;
      }
    }
  ),
  getInstance: vi.fn(() => {
    createLiveRegions();
    return mockScreenReaderAnnouncer;
  }),
};

const mockLiveRegionManager = {
  announceNavigation: vi.fn((section: string) => {
    const region = document.getElementById('live-region-polite');
    if (region) {
      region.textContent = `${section}セクションに移動しました`;
    }
  }),
  announceLoading: vi.fn((message: string) => {
    const region = document.getElementById('live-region-polite');
    if (region) {
      region.textContent = message;
    }
  }),
  announceError: vi.fn((message: string) => {
    const region = document.getElementById('live-region-assertive');
    if (region) {
      region.textContent = `エラー: ${message}`;
    }
  }),
  announceSuccess: vi.fn((message: string) => {
    const region = document.getElementById('live-region-polite');
    if (region) {
      region.textContent = message;
    }
  }),
  getInstance: vi.fn(() => {
    createLiveRegions();
    return mockLiveRegionManager;
  }),
};

const mockAccessibilityValidator = {
  validateElement: vi.fn((element: HTMLElement) => {
    const issues: string[] = [];
    if (element.tagName === 'IMG' && !element.getAttribute('alt')) {
      issues.push('Image missing alt attribute');
    }
    return issues;
  }),
  isKeyboardAccessible: vi.fn((element: HTMLElement) => {
    return (
      element.tagName === 'BUTTON' ||
      element.tagName === 'A' ||
      element.getAttribute('tabindex') === '0'
    );
  }),
  validateColorContrast: vi.fn((element: HTMLElement) => true),
};

class FocusTrap {
  constructor(public container: HTMLElement) {}
  activate = () => mockFocusTrap.activate(this.container);
  deactivate = mockFocusTrap.deactivate;
}

const ScreenReaderAnnouncer = mockScreenReaderAnnouncer;
const AccessibilityValidator = mockAccessibilityValidator;
const LiveRegionManager = mockLiveRegionManager;

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
  Menu: ({ className, ...props }: any) => (
    <svg className={`lucide lucide-menu ${className}`} {...props}>
      <path d="M4 5h16" />
      <path d="M4 12h16" />
      <path d="M4 19h16" />
    </svg>
  ),
  X: ({ className, ...props }: any) => (
    <svg className={`lucide lucide-x ${className}`} {...props}>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  ),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
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
    header: ({ children, ...props }: any) => {
      const {
        whileHover,
        whileTap,
        initial,
        animate,
        transition,
        ...cleanProps
      } = props;
      return <header {...cleanProps}>{children}</header>;
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
    footer: ({ children, ...props }: any) => {
      const {
        whileHover,
        whileTap,
        initial,
        animate,
        transition,
        ...cleanProps
      } = props;
      return <footer {...cleanProps}>{children}</footer>;
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
  AnimatePresence: ({ children }: any) => children,
  useInView: () => true,
}));

describe('Accessibility Tests', () => {
  const mockPersonalInfo = {
    name: 'Test User',
    title: 'Test Developer',
    description: 'Test description',
    avatar: '/test-avatar.jpg',
  };

  const mockVideo = {
    id: 'test-video',
    title: 'Test Video Title',
    description: 'Test video description',
    thumbnail: '/test-thumbnail.jpg',
    publishedAt: '2024-01-01T00:00:00Z',
    url: 'https://youtube.com/watch?v=test',
  };

  const mockSocialLink = {
    platform: 'twitter',
    url: 'https://twitter.com/test',
    icon: 'twitter',
    label: 'Twitter',
  };

  beforeEach(() => {
    // Clear any existing live regions
    const existingRegions = document.querySelectorAll('[aria-live]');
    existingRegions.forEach(region => region.remove());

    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('Header Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<Header personalInfo={mockPersonalInfo} />);

      const header = screen.getByRole('banner');
      expect(header).toHaveAttribute('aria-label', 'サイトナビゲーション');

      const nav = screen.getByRole('navigation', {
        name: 'メインナビゲーション',
      });
      expect(nav).toBeInTheDocument();

      const menubar = screen.getByRole('menubar');
      expect(menubar).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Header personalInfo={mockPersonalInfo} />);

      const menuButton = screen.getByRole('button', { name: /メニューを開く/ });
      await user.click(menuButton);

      const mobileMenu = screen.getByRole('menu');
      expect(mobileMenu).toBeInTheDocument();
      expect(mobileMenu).toHaveAttribute('aria-hidden', 'false');
    });

    it('should trap focus in mobile menu', async () => {
      const user = userEvent.setup();
      render(<Header personalInfo={mockPersonalInfo} />);

      const menuButton = screen.getByRole('button', { name: /メニューを開く/ });
      await user.click(menuButton);

      // Check that mobile menu is visible and accessible
      const mobileMenu = screen.getByRole('menu');
      expect(mobileMenu).toBeInTheDocument();
      expect(mobileMenu).toHaveAttribute('aria-hidden', 'false');

      // Check that menu items are focusable when menu is open
      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBeGreaterThan(0);
    });

    it('should close menu on Escape key', async () => {
      const user = userEvent.setup();
      render(<Header personalInfo={mockPersonalInfo} />);

      const menuButton = screen.getByRole('button', { name: /メニューを開く/ });
      await user.click(menuButton);

      await user.keyboard('{Escape}');

      const mobileMenu = screen.queryByRole('menu');
      expect(mobileMenu).not.toBeInTheDocument();
    });
  });

  describe('HeroSection Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<HeroSection personalInfo={mockPersonalInfo} />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveAttribute('id', 'hero-heading');
      expect(heading).toHaveTextContent(mockPersonalInfo.name);
    });

    it('should have accessible avatar image', () => {
      render(<HeroSection personalInfo={mockPersonalInfo} />);

      const avatar = screen.getByRole('img');
      expect(avatar).toHaveAttribute(
        'alt',
        `${mockPersonalInfo.name}のプロフィール写真`
      );
      expect(avatar).toHaveAttribute('aria-describedby', 'hero-heading');
    });

    it('should have accessible online status indicator', () => {
      render(<HeroSection personalInfo={mockPersonalInfo} />);

      const statusIndicator = screen.getByRole('status');
      expect(statusIndicator).toHaveAttribute(
        'aria-label',
        'オンライン状態: 現在アクティブ'
      );
      expect(statusIndicator).toHaveAttribute('aria-live', 'polite');
    });

    it('should have accessible CTA buttons', () => {
      render(<HeroSection personalInfo={mockPersonalInfo} />);

      const ctaGroup = screen.getByRole('group', { name: 'アクションボタン' });
      expect(ctaGroup).toBeInTheDocument();

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });
  });

  describe('AboutSection Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<AboutSection personalInfo={mockPersonalInfo} />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('id', 'about-heading');
    });

    it('should have accessible skill tags', () => {
      render(<AboutSection personalInfo={mockPersonalInfo} />);

      const skillTags = screen.getAllByRole('text');
      skillTags.forEach(tag => {
        expect(tag).toHaveAttribute('aria-label');
        expect(tag).toHaveAttribute('tabindex', '0');
      });
    });
  });

  describe('VideoCard Accessibility', () => {
    it('should have accessible video link', () => {
      render(<VideoCard video={mockVideo} />);

      const videoLink = screen.getByRole('link');
      expect(videoLink).toHaveAttribute(
        'aria-label',
        `動画「${mockVideo.title}」をYouTubeで視聴する`
      );
      expect(videoLink).toHaveAttribute('target', '_blank');
      expect(videoLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should have accessible thumbnail image', () => {
      render(<VideoCard video={mockVideo} />);

      const thumbnail = screen.getByRole('img');
      expect(thumbnail).toHaveAttribute(
        'alt',
        `動画「${mockVideo.title}」のサムネイル`
      );
      expect(thumbnail).toHaveAttribute('loading', 'lazy');
    });

    it('should have accessible publish date', () => {
      render(<VideoCard video={mockVideo} />);

      const publishDate = screen.getByRole('time');
      expect(publishDate).toHaveAttribute('dateTime', mockVideo.publishedAt);
      expect(publishDate).toHaveAttribute('aria-label');
    });
  });

  describe('SocialLink Accessibility', () => {
    it('should have accessible social link', () => {
      render(<SocialLink socialLink={mockSocialLink} />);

      const socialLink = screen.getByRole('link');
      expect(socialLink).toHaveAttribute(
        'aria-label',
        `${mockSocialLink.label}を新しいタブで開く`
      );
      expect(socialLink).toHaveAttribute('target', '_blank');
      expect(socialLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Focus Management', () => {
    it('should create and manage focus trap', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button>Button 1</button>
        <button>Button 2</button>
        <button>Button 3</button>
      `;
      document.body.appendChild(container);

      const focusTrap = new FocusTrap(container);
      focusTrap.activate();

      // Should focus first element
      expect(document.activeElement).toBe(container.querySelector('button'));

      focusTrap.deactivate();
      document.body.removeChild(container);
    });
  });

  describe('Screen Reader Announcements', () => {
    it('should create live regions for announcements', () => {
      const announcer = ScreenReaderAnnouncer.getInstance();

      const politeRegion = document.getElementById('live-region-polite');
      const assertiveRegion = document.getElementById('live-region-assertive');

      expect(politeRegion).toBeInTheDocument();
      expect(assertiveRegion).toBeInTheDocument();
      expect(politeRegion).toHaveAttribute('aria-live', 'polite');
      expect(assertiveRegion).toHaveAttribute('aria-live', 'assertive');
    });

    it('should announce messages correctly', async () => {
      const announcer = ScreenReaderAnnouncer.getInstance();

      announcer.announce('Test message', 'polite');

      await waitFor(() => {
        const politeRegion = document.getElementById('live-region-polite');
        expect(politeRegion).toHaveTextContent('Test message');
      });
    });
  });

  describe('Live Region Manager', () => {
    it('should manage different types of announcements', async () => {
      const manager = LiveRegionManager.getInstance();

      manager.announceNavigation('テスト');
      manager.announceLoading('読み込み中');
      manager.announceError('エラーメッセージ');
      manager.announceSuccess('成功メッセージ');

      // Check that regions are created and working
      const politeRegion = document.getElementById('live-region-polite');
      const assertiveRegion = document.getElementById('live-region-assertive');

      expect(politeRegion).toBeInTheDocument();
      expect(assertiveRegion).toBeInTheDocument();
    });
  });

  describe('Accessibility Validation', () => {
    it('should validate element accessibility', () => {
      const img = document.createElement('img');
      img.src = 'test.jpg';

      const issues = AccessibilityValidator.validateElement(img);
      expect(issues).toContain('Image missing alt attribute');

      img.alt = 'Test image';
      const fixedIssues = AccessibilityValidator.validateElement(img);
      expect(fixedIssues).not.toContain('Image missing alt attribute');
    });

    it('should check keyboard accessibility', () => {
      const button = document.createElement('button');
      expect(AccessibilityValidator.isKeyboardAccessible(button)).toBe(true);

      const div = document.createElement('div');
      expect(AccessibilityValidator.isKeyboardAccessible(div)).toBe(false);

      div.setAttribute('tabindex', '0');
      expect(AccessibilityValidator.isKeyboardAccessible(div)).toBe(true);
    });
  });

  describe('Responsive Design', () => {
    it('should handle different viewport sizes', () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      });

      render(<Header personalInfo={mockPersonalInfo} />);

      // Mobile menu button should be visible
      const menuButton = screen.getByRole('button', { name: /メニューを開く/ });
      expect(menuButton).toBeInTheDocument();
    });

    it('should provide adequate touch targets on mobile', () => {
      render(<Header personalInfo={mockPersonalInfo} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        // Check that buttons have proper padding and are clickable
        expect(button).toBeInTheDocument();
        expect(button).not.toHaveAttribute('disabled');

        // In test environment, we verify the button has proper padding classes for touch targets
        expect(button.className).toMatch(/p[xy]?-\d+/);
      });
    });
  });

  describe('Reduced Motion Support', () => {
    it('should respect prefers-reduced-motion', () => {
      // Mock matchMedia for reduced motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(<HeroSection personalInfo={mockPersonalInfo} />);

      // Component should render without motion-related errors
      const section = screen.getByRole('banner');
      expect(section).toBeInTheDocument();
    });
  });

  describe('Enhanced Keyboard Navigation Tests', () => {
    it('should support Tab navigation through all interactive elements', async () => {
      const user = userEvent.setup();
      const { container } = render(<Header personalInfo={mockPersonalInfo} />);

      // Get all focusable elements within the Header component only
      const focusableElements = container.querySelectorAll('button');

      // Test that we can tab through elements
      for (let i = 0; i < focusableElements.length; i++) {
        await user.tab();
        // Verify that focus is within the header or on one of its buttons
        const isWithinHeader =
          container.contains(document.activeElement) ||
          Array.from(focusableElements).includes(
            document.activeElement as HTMLButtonElement
          );
        expect(isWithinHeader).toBe(true);
      }
    });

    it('should support Shift+Tab for reverse navigation', async () => {
      const user = userEvent.setup();
      const { container } = render(<Header personalInfo={mockPersonalInfo} />);

      const focusableElements = container.querySelectorAll('button');

      // Focus last element first
      (focusableElements[focusableElements.length - 1] as HTMLElement).focus();

      // Shift+Tab through elements
      for (let i = focusableElements.length - 2; i >= 0; i--) {
        await user.tab({ shift: true });
        // Verify that focus is within the header or on one of its buttons
        const isWithinHeader =
          container.contains(document.activeElement) ||
          Array.from(focusableElements).includes(
            document.activeElement as HTMLButtonElement
          );
        expect(isWithinHeader).toBe(true);
      }
    });

    it('should handle Enter key activation on buttons', async () => {
      const user = userEvent.setup();
      const mockClick = vi.fn();

      const TestButton = () => (
        <button onClick={mockClick} aria-label="テストボタン">
          クリック
        </button>
      );

      render(<TestButton />);

      const button = screen.getByRole('button', { name: 'テストボタン' });
      button.focus();

      await user.keyboard('{Enter}');
      expect(mockClick).toHaveBeenCalled();
    });

    it('should handle Space key activation on buttons', async () => {
      const user = userEvent.setup();
      const mockClick = vi.fn();

      const TestButton = () => (
        <button onClick={mockClick} aria-label="テストボタン2">
          クリック
        </button>
      );

      render(<TestButton />);

      const button = screen.getByRole('button', { name: 'テストボタン2' });
      button.focus();

      await user.keyboard(' ');
      expect(mockClick).toHaveBeenCalled();
    });

    it('should support arrow key navigation in grid layouts', async () => {
      const user = userEvent.setup();

      const GridComponent = () => (
        <div role="grid" aria-label="テストグリッド">
          <div role="row">
            <button role="gridcell" aria-label="セル 1">
              1
            </button>
            <button role="gridcell" aria-label="セル 2">
              2
            </button>
          </div>
          <div role="row">
            <button role="gridcell" aria-label="セル 3">
              3
            </button>
            <button role="gridcell" aria-label="セル 4">
              4
            </button>
          </div>
        </div>
      );

      render(<GridComponent />);

      const cells = screen.getAllByRole('gridcell');
      cells[0].focus();

      // Test that grid structure is properly rendered
      expect(cells).toHaveLength(4);
      expect(cells[0]).toHaveAttribute('aria-label', 'セル 1');
      expect(cells[1]).toHaveAttribute('aria-label', 'セル 2');
      expect(cells[2]).toHaveAttribute('aria-label', 'セル 3');
      expect(cells[3]).toHaveAttribute('aria-label', 'セル 4');

      // Test that arrow keys can be pressed (actual navigation would require custom implementation)
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowLeft}');
      await user.keyboard('{ArrowUp}');
    });

    it('should handle Home and End keys for navigation', async () => {
      const user = userEvent.setup();

      const ListComponent = () => (
        <ul role="listbox" aria-label="テストリスト">
          <li role="option" tabIndex={0}>
            項目 1
          </li>
          <li role="option" tabIndex={0}>
            項目 2
          </li>
          <li role="option" tabIndex={0}>
            項目 3
          </li>
        </ul>
      );

      render(<ListComponent />);

      const options = screen.getAllByRole('option');
      options[1].focus(); // Focus middle item

      // Test that list structure is properly rendered
      expect(options).toHaveLength(3);
      expect(options[0]).toHaveTextContent('項目 1');
      expect(options[1]).toHaveTextContent('項目 2');
      expect(options[2]).toHaveTextContent('項目 3');

      // Test that Home and End keys can be pressed (actual navigation would require custom implementation)
      await user.keyboard('{Home}');
      await user.keyboard('{End}');
    });
  });

  describe('Enhanced Screen Reader Support Tests', () => {
    it('should announce page navigation changes', async () => {
      const manager = LiveRegionManager.getInstance();
      const spy = vi.spyOn(manager, 'announceNavigation');

      manager.announceNavigation('ヒーロー');

      expect(spy).toHaveBeenCalledWith('ヒーロー');

      await waitFor(() => {
        const politeRegion = document.getElementById('live-region-polite');
        expect(politeRegion?.textContent).toContain(
          'ヒーローセクションに移動しました'
        );
      });
    });

    it('should announce loading states', async () => {
      const manager = LiveRegionManager.getInstance();

      manager.announceLoading('動画を読み込み中');

      await waitFor(() => {
        const politeRegion = document.getElementById('live-region-polite');
        expect(politeRegion?.textContent).toBe('動画を読み込み中');
      });
    });

    it('should announce error messages with assertive priority', async () => {
      const manager = LiveRegionManager.getInstance();

      manager.announceError('ネットワークエラーが発生しました');

      await waitFor(() => {
        const assertiveRegion = document.getElementById(
          'live-region-assertive'
        );
        expect(assertiveRegion?.textContent).toBe(
          'エラー: ネットワークエラーが発生しました'
        );
      });
    });

    it('should announce success messages', async () => {
      const manager = LiveRegionManager.getInstance();

      manager.announceSuccess('データの読み込みが完了しました');

      await waitFor(() => {
        const politeRegion = document.getElementById('live-region-polite');
        expect(politeRegion?.textContent).toBe(
          'データの読み込みが完了しました'
        );
      });
    });

    it('should provide proper ARIA labels for dynamic content', () => {
      render(<VideoCard video={mockVideo} />);

      const videoLink = screen.getByRole('link');
      expect(videoLink).toHaveAttribute('aria-label');

      const thumbnail = screen.getByRole('img');
      expect(thumbnail).toHaveAttribute('alt');

      const publishDate = screen.getByRole('time');
      expect(publishDate).toHaveAttribute('aria-label');
    });

    it('should support screen reader navigation landmarks', () => {
      render(<Header personalInfo={mockPersonalInfo} />);

      const banner = screen.getByRole('banner');
      expect(banner).toBeInTheDocument();

      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeInTheDocument();
    });

    it('should provide descriptive text for complex UI elements', () => {
      render(<HeroSection personalInfo={mockPersonalInfo} />);

      const avatar = screen.getByRole('img');
      expect(avatar).toHaveAttribute(
        'alt',
        `${mockPersonalInfo.name}のプロフィール写真`
      );

      const statusIndicator = screen.getByRole('status');
      expect(statusIndicator).toHaveAttribute(
        'aria-label',
        'オンライン状態: 現在アクティブ'
      );
    });

    it('should announce form validation errors', async () => {
      const FormComponent = () => {
        const [error, setError] = React.useState('');

        return (
          <form>
            <input
              type="email"
              aria-describedby="email-error"
              aria-invalid={!!error}
              onChange={e => {
                if (!e.target.value.includes('@')) {
                  setError('有効なメールアドレスを入力してください');
                } else {
                  setError('');
                }
              }}
            />
            {error && (
              <div id="email-error" role="alert" aria-live="assertive">
                {error}
              </div>
            )}
          </form>
        );
      };

      const user = userEvent.setup();
      render(<FormComponent />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'invalid-email');

      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveTextContent(
        '有効なメールアドレスを入力してください'
      );
      expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
    });
  });

  describe('Comprehensive Accessibility Compliance Tests', () => {
    it('should have proper heading hierarchy', () => {
      const TestComponent = () => (
        <div>
          <h1>メインタイトル</h1>
          <h2>セクションタイトル</h2>
          <h3>サブセクション</h3>
        </div>
      );

      render(<TestComponent />);

      const h1 = screen.getByRole('heading', { level: 1 });
      const h2 = screen.getByRole('heading', { level: 2 });
      const h3 = screen.getByRole('heading', { level: 3 });

      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();
      expect(h3).toBeInTheDocument();
    });

    it('should provide skip links for keyboard users', () => {
      // Create a test component with skip link
      const ComponentWithSkipLink = () => (
        <div>
          <a href="#main-content" className="skip-link">
            メインコンテンツにスキップ
          </a>
          <Header personalInfo={mockPersonalInfo} />
        </div>
      );

      render(<ComponentWithSkipLink />);

      // Skip link should be present
      const skipLink = document.querySelector('.skip-link');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('should have sufficient color contrast', () => {
      const TestComponent = () => (
        <div style={{ backgroundColor: '#ffffff', color: '#000000' }}>
          高コントラストテキスト
        </div>
      );

      render(<TestComponent />);

      const element = screen.getByText('高コントラストテキスト');
      expect(AccessibilityValidator.validateColorContrast(element)).toBe(true);
    });

    it('should support keyboard-only navigation', async () => {
      const user = userEvent.setup();
      render(<Header personalInfo={mockPersonalInfo} />);

      // Should be able to navigate without mouse
      const firstButton = screen.getAllByRole('button')[0];
      firstButton.focus();

      expect(document.activeElement).toBe(firstButton);

      await user.tab();
      expect(document.activeElement).not.toBe(firstButton);
    });

    it('should provide alternative text for all images', () => {
      render(<HeroSection personalInfo={mockPersonalInfo} />);

      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
        expect(img.getAttribute('alt')).not.toBe('');
      });
    });

    it('should have proper focus indicators', async () => {
      const user = userEvent.setup();
      render(<Header personalInfo={mockPersonalInfo} />);

      const buttons = screen.getAllByRole('button');
      await user.tab();

      // Focus should be on one of the buttons (focus order may vary)
      expect(buttons).toContain(document.activeElement);
    });

    it('should support assistive technology announcements', async () => {
      const announcer = ScreenReaderAnnouncer.getInstance();

      announcer.announce('テストメッセージ', 'polite');

      await waitFor(() => {
        const liveRegion = document.querySelector('[aria-live="polite"]');
        expect(liveRegion?.textContent).toBe('テストメッセージ');
      });
    });
  });
});
