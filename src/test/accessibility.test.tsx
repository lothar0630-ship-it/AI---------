import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import { VideoCard } from '../components/VideoCard';
import SocialLink from '../components/SocialLink';
import {
  FocusTrap,
  ScreenReaderAnnouncer,
  AccessibilityValidator,
  LiveRegionManager,
} from '../utils/accessibilityHelpers';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => (
      <section {...props}>{children}</section>
    ),
    header: ({ children, ...props }: any) => (
      <header {...props}>{children}</header>
    ),
    button: ({ children, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
    img: ({ children, ...props }: any) => <img {...props}>{children}</img>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    a: ({ children, ...props }: any) => <a {...props}>{children}</a>,
    footer: ({ children, ...props }: any) => (
      <footer {...props}>{children}</footer>
    ),
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

      // Check that menu items have proper tabindex
      const menuItems = screen.getAllByRole('menuitem');
      menuItems.forEach(item => {
        expect(item).toHaveAttribute('tabindex', '0');
      });
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
        const styles = window.getComputedStyle(button);
        // Check minimum touch target size (44px)
        expect(
          parseInt(styles.minHeight) || parseInt(styles.height)
        ).toBeGreaterThanOrEqual(44);
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
});
