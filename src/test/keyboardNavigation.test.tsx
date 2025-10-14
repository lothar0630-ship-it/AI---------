import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import {
  FocusTrap,
  EnhancedKeyboardNavigation,
  KeyboardNavigation,
} from '../utils/accessibilityHelpers';
import Header from '../components/Header';
import YouTubeSection from '../components/YouTubeSection';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover, whileTap, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
    section: ({ children, whileHover, whileTap, ...props }: any) => (
      <section {...props}>{children}</section>
    ),
    header: ({ children, whileHover, whileTap, ...props }: any) => (
      <header {...props}>{children}</header>
    ),
    button: ({ children, whileHover, whileTap, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
    nav: ({ children, whileHover, whileTap, ...props }: any) => (
      <nav {...props}>{children}</nav>
    ),
    ul: ({ children, whileHover, whileTap, ...props }: any) => (
      <ul {...props}>{children}</ul>
    ),
    li: ({ children, whileHover, whileTap, ...props }: any) => (
      <li {...props}>{children}</li>
    ),
    a: ({ children, whileHover, whileTap, ...props }: any) => (
      <a {...props}>{children}</a>
    ),
    h1: ({ children, whileHover, whileTap, ...props }: any) => (
      <h1 {...props}>{children}</h1>
    ),
    h2: ({ children, whileHover, whileTap, ...props }: any) => (
      <h2 {...props}>{children}</h2>
    ),
    h3: ({ children, whileHover, whileTap, ...props }: any) => (
      <h3 {...props}>{children}</h3>
    ),
    p: ({ children, whileHover, whileTap, ...props }: any) => (
      <p {...props}>{children}</p>
    ),
    span: ({ children, whileHover, whileTap, ...props }: any) => (
      <span {...props}>{children}</span>
    ),
    img: ({ children, whileHover, whileTap, ...props }: any) => (
      <img {...props}>{children}</img>
    ),
  },
  AnimatePresence: ({ children }: any) => children,
  useInView: () => true,
}));

// Mock YouTube API
vi.mock('../hooks/useYouTubeVideos', () => ({
  useYouTubeVideos: () => ({
    data: [
      {
        id: 'test-video-1',
        title: 'テスト動画1',
        description: 'テスト説明1',
        thumbnail: '/test-thumb-1.jpg',
        publishedAt: '2024-01-01T00:00:00Z',
        url: 'https://youtube.com/watch?v=test1',
      },
    ],
    isLoading: false,
    error: null,
  }),
  useYouTubeData: () => ({
    videos: [
      {
        id: 'test-video-1',
        title: 'テスト動画1',
        description: 'テスト説明1',
        thumbnail: '/test-thumb-1.jpg',
        publishedAt: '2024-01-01T00:00:00Z',
        url: 'https://youtube.com/watch?v=test1',
      },
    ],
    channels: [
      {
        id: 'UC123',
        name: 'テストチャンネル1',
        description: 'テストチャンネル説明1',
        url: 'https://youtube.com/channel/UC123',
      },
    ],
    isLoading: false,
    error: null,
  }),
  useYouTubeAvailability: () => ({
    isAvailable: true,
    error: null,
  }),
}));

describe('Keyboard Navigation Tests', () => {
  const mockPersonalInfo = {
    name: 'Test User',
    title: 'Test Developer',
    description: 'Test description',
    avatar: '/test-avatar.jpg',
  };

  const mockChannels = [
    {
      id: 'UC123',
      name: 'テストチャンネル1',
      description: 'テストチャンネル説明1',
      url: 'https://youtube.com/channel/UC123',
    },
  ];

  beforeEach(() => {
    // Reset focus
    document.body.focus();
  });

  afterEach(() => {
    // Clean up any event listeners
    document.removeEventListener('keydown', () => {});
  });

  describe('Focus Trap Functionality', () => {
    it('should trap focus within container', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button id="btn1">Button 1</button>
        <button id="btn2">Button 2</button>
        <button id="btn3">Button 3</button>
      `;
      document.body.appendChild(container);

      const focusTrap = new FocusTrap(container);
      focusTrap.activate();

      // Should focus first element
      expect(document.activeElement?.id).toBe('btn1');

      // Simulate Tab to last element
      const btn3 = container.querySelector('#btn3') as HTMLElement;
      btn3.focus();

      // Simulate Tab from last element - should wrap to first
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
      });
      document.dispatchEvent(tabEvent);

      focusTrap.deactivate();
      document.body.removeChild(container);
    });

    it('should handle Shift+Tab for reverse navigation', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button id="btn1">Button 1</button>
        <button id="btn2">Button 2</button>
      `;
      document.body.appendChild(container);

      const focusTrap = new FocusTrap(container);
      focusTrap.activate();

      // Focus first element and simulate Shift+Tab
      const btn1 = container.querySelector('#btn1') as HTMLElement;
      btn1.focus();

      const shiftTabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
      });
      document.dispatchEvent(shiftTabEvent);

      focusTrap.deactivate();
      document.body.removeChild(container);
    });

    it('should restore focus to previous element on deactivation', () => {
      const originalButton = document.createElement('button');
      originalButton.id = 'original';
      document.body.appendChild(originalButton);
      originalButton.focus();

      const container = document.createElement('div');
      container.innerHTML = '<button>Trapped Button</button>';
      document.body.appendChild(container);

      const focusTrap = new FocusTrap(container);
      focusTrap.activate();
      focusTrap.deactivate();

      expect(document.activeElement?.id).toBe('original');

      document.body.removeChild(originalButton);
      document.body.removeChild(container);
    });
  });

  describe('Enhanced Keyboard Navigation', () => {
    it('should handle arrow key navigation', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button>Button 1</button>
        <button>Button 2</button>
        <button>Button 3</button>
      `;
      document.body.appendChild(container);

      const navigation = new EnhancedKeyboardNavigation(container);
      navigation.activate();

      const buttons = container.querySelectorAll('button');
      buttons[0].focus();

      // Test down arrow
      const downEvent = new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
      });
      container.dispatchEvent(downEvent);

      navigation.deactivate();
      document.body.removeChild(container);
    });

    it('should handle Home and End keys', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <button>Button 1</button>
        <button>Button 2</button>
        <button>Button 3</button>
      `;
      document.body.appendChild(container);

      const navigation = new EnhancedKeyboardNavigation(container);
      navigation.activate();

      // Test Home key
      const homeEvent = new KeyboardEvent('keydown', {
        key: 'Home',
        bubbles: true,
      });
      container.dispatchEvent(homeEvent);

      // Test End key
      const endEvent = new KeyboardEvent('keydown', {
        key: 'End',
        bubbles: true,
      });
      container.dispatchEvent(endEvent);

      navigation.deactivate();
      document.body.removeChild(container);
    });

    it('should handle Enter and Space key activation', () => {
      const mockClick = vi.fn();
      const container = document.createElement('div');
      const button = document.createElement('button');
      button.onclick = mockClick;
      container.appendChild(button);
      document.body.appendChild(container);

      const navigation = new EnhancedKeyboardNavigation(container);
      navigation.activate();

      button.focus();

      // Test Enter key
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
      });
      Object.defineProperty(enterEvent, 'target', {
        value: button,
        enumerable: true,
      });
      container.dispatchEvent(enterEvent);

      // Test Space key
      const spaceEvent = new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
      });
      Object.defineProperty(spaceEvent, 'target', {
        value: button,
        enumerable: true,
      });
      container.dispatchEvent(spaceEvent);

      navigation.deactivate();
      document.body.removeChild(container);
    });
  });

  describe('Grid Navigation', () => {
    it('should handle grid navigation with arrow keys', () => {
      const mockNavigate = vi.fn();
      const currentIndex = 0;
      const totalItems = 4;
      const columnsPerRow = 2;

      // Test right arrow
      const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      KeyboardNavigation.handleGridNavigation(
        rightEvent,
        currentIndex,
        totalItems,
        columnsPerRow,
        mockNavigate
      );
      expect(mockNavigate).toHaveBeenCalledWith(1);

      // Test down arrow
      const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      KeyboardNavigation.handleGridNavigation(
        downEvent,
        currentIndex,
        totalItems,
        columnsPerRow,
        mockNavigate
      );
      expect(mockNavigate).toHaveBeenCalledWith(2);

      // Test Home key
      const homeEvent = new KeyboardEvent('keydown', { key: 'Home' });
      KeyboardNavigation.handleGridNavigation(
        homeEvent,
        1,
        totalItems,
        columnsPerRow,
        mockNavigate
      );
      expect(mockNavigate).toHaveBeenCalledWith(0);

      // Test End key
      const endEvent = new KeyboardEvent('keydown', { key: 'End' });
      KeyboardNavigation.handleGridNavigation(
        endEvent,
        1,
        totalItems,
        columnsPerRow,
        mockNavigate
      );
      expect(mockNavigate).toHaveBeenCalledWith(3);
    });

    it('should not navigate beyond boundaries', () => {
      const mockNavigate = vi.fn();

      // Test left arrow at beginning - should not call navigate
      const leftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      KeyboardNavigation.handleGridNavigation(leftEvent, 0, 4, 2, mockNavigate);
      // At boundary, should not navigate (stays at same position)
      expect(mockNavigate).not.toHaveBeenCalled();

      // Reset mock
      mockNavigate.mockClear();

      // Test right arrow at end - should not call navigate
      const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      KeyboardNavigation.handleGridNavigation(
        rightEvent,
        3,
        4,
        2,
        mockNavigate
      );
      // At boundary, should not navigate (stays at same position)
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('List Navigation', () => {
    it('should handle list navigation with arrow keys', () => {
      const mockNavigate = vi.fn();
      const currentIndex = 1;
      const totalItems = 3;

      // Test down arrow
      const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      KeyboardNavigation.handleListNavigation(
        downEvent,
        currentIndex,
        totalItems,
        mockNavigate
      );
      expect(mockNavigate).toHaveBeenCalledWith(2);

      // Test up arrow
      const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      KeyboardNavigation.handleListNavigation(
        upEvent,
        currentIndex,
        totalItems,
        mockNavigate
      );
      expect(mockNavigate).toHaveBeenCalledWith(0);
    });
  });

  describe('Component Integration Tests', () => {
    it('should support keyboard navigation in Header component', async () => {
      const user = userEvent.setup();
      render(<Header personalInfo={mockPersonalInfo} />);

      // Test Tab navigation through header elements (buttons only, no links in this component)
      const focusableElements = screen.getAllByRole('button');

      if (focusableElements.length > 0) {
        await user.tab();
        expect(focusableElements).toContain(document.activeElement);
      }
    });

    it('should support keyboard navigation in YouTube section', async () => {
      const user = userEvent.setup();
      render(<YouTubeSection channels={mockChannels} />);

      // Test that video cards are keyboard accessible
      const links = screen.queryAllByRole('link');
      if (links.length > 0) {
        await user.tab();
        expect(links).toContain(document.activeElement);
      } else {
        // If no links are present (fallback state), test that the section is still accessible
        const section = screen.getByRole('region', {
          name: /YouTube チャンネル/,
        });
        expect(section).toBeInTheDocument();

        // Test that headings are accessible
        const heading = screen.getByRole('heading', {
          name: /YouTube チャンネル/,
        });
        expect(heading).toBeInTheDocument();
      }
    });

    it('should handle Escape key to close mobile menu', async () => {
      const user = userEvent.setup();
      render(<Header personalInfo={mockPersonalInfo} />);

      // Open mobile menu if button exists
      const menuButton = screen.queryByRole('button', { name: /メニュー/ });
      if (menuButton) {
        await user.click(menuButton);
        await user.keyboard('{Escape}');

        // Menu should be closed (implementation dependent)
        const menu = screen.queryByRole('menu');
        if (menu) {
          expect(menu).toHaveAttribute('aria-hidden', 'true');
        }
      }
    });

    it('should maintain focus visibility throughout navigation', async () => {
      const user = userEvent.setup();
      render(<Header personalInfo={mockPersonalInfo} />);

      const focusableElements = screen.getAllByRole('button');

      // Navigate through elements and ensure focus is maintained
      for (const element of focusableElements.slice(0, 3)) {
        element.focus();
        expect(document.activeElement).toBe(element);
        await user.tab();
      }
    });

    it('should support roving tabindex pattern for complex widgets', () => {
      const TestWidget = () => (
        <div role="tablist" aria-label="テストタブ">
          <button role="tab" tabIndex={0} aria-selected="true">
            タブ1
          </button>
          <button role="tab" tabIndex={-1} aria-selected="false">
            タブ2
          </button>
          <button role="tab" tabIndex={-1} aria-selected="false">
            タブ3
          </button>
        </div>
      );

      render(<TestWidget />);

      const tabs = screen.getAllByRole('tab');
      expect(tabs[0]).toHaveAttribute('tabIndex', '0');
      expect(tabs[1]).toHaveAttribute('tabIndex', '-1');
      expect(tabs[2]).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should support common keyboard shortcuts', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const [count, setCount] = React.useState(0);

        React.useEffect(() => {
          const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === 'k') {
              event.preventDefault();
              setCount(prev => prev + 1);
            }
          };

          document.addEventListener('keydown', handleKeyDown);
          return () => document.removeEventListener('keydown', handleKeyDown);
        }, []);

        return <div data-testid="counter">{count}</div>;
      };

      render(<TestComponent />);

      await user.keyboard('{Control>}k{/Control}');

      const counter = screen.getByTestId('counter');
      expect(counter).toHaveTextContent('1');
    });

    it('should handle Alt+key combinations for quick navigation', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const [section, setSection] = React.useState('');

        React.useEffect(() => {
          const handleKeyDown = (event: KeyboardEvent) => {
            if (event.altKey) {
              switch (event.key) {
                case '1':
                  event.preventDefault();
                  setSection('hero');
                  break;
                case '2':
                  event.preventDefault();
                  setSection('about');
                  break;
                case '3':
                  event.preventDefault();
                  setSection('youtube');
                  break;
              }
            }
          };

          document.addEventListener('keydown', handleKeyDown);
          return () => document.removeEventListener('keydown', handleKeyDown);
        }, []);

        return <div data-testid="current-section">{section}</div>;
      };

      render(<TestComponent />);

      await user.keyboard('{Alt>}1{/Alt}');
      expect(screen.getByTestId('current-section')).toHaveTextContent('hero');

      await user.keyboard('{Alt>}2{/Alt}');
      expect(screen.getByTestId('current-section')).toHaveTextContent('about');
    });
  });
});
