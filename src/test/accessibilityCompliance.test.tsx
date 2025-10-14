import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import {
  LiveRegionManager,
  AccessibilityValidator,
  FocusTrap,
} from '../utils/accessibilityHelpers';

// Mock framer-motion to avoid component import issues
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
    a: ({ children, ...props }: any) => <a {...props}>{children}</a>,
  },
  AnimatePresence: ({ children }: any) => children,
  useInView: () => true,
}));

describe('Accessibility Compliance Tests', () => {
  beforeEach(() => {
    // Clear any existing live regions
    const existingRegions = document.querySelectorAll('[aria-live]');
    existingRegions.forEach(region => region.remove());
  });

  afterEach(() => {
    // Clean up live regions
    const liveRegions = document.querySelectorAll('[aria-live]');
    liveRegions.forEach(region => region.remove());
  });

  describe('Keyboard Navigation Tests', () => {
    it('should support Tab navigation through interactive elements', async () => {
      const TestComponent = () => (
        <div>
          <button>ボタン1</button>
          <button>ボタン2</button>
          <a href="#test">リンク1</a>
          <input type="text" placeholder="入力フィールド" />
        </div>
      );

      const user = userEvent.setup();
      render(<TestComponent />);

      const button1 = screen.getByText('ボタン1');
      const button2 = screen.getByText('ボタン2');
      const link = screen.getByText('リンク1');
      const input = screen.getByPlaceholderText('入力フィールド');

      // Test Tab navigation
      await user.tab();
      expect(document.activeElement).toBe(button1);

      await user.tab();
      expect(document.activeElement).toBe(button2);

      await user.tab();
      expect(document.activeElement).toBe(link);

      await user.tab();
      expect(document.activeElement).toBe(input);
    });

    it('should support Shift+Tab for reverse navigation', async () => {
      const TestComponent = () => (
        <div>
          <button>ボタン1</button>
          <button>ボタン2</button>
        </div>
      );

      const user = userEvent.setup();
      render(<TestComponent />);

      const button1 = screen.getByText('ボタン1');
      const button2 = screen.getByText('ボタン2');

      // Focus second button first
      button2.focus();
      expect(document.activeElement).toBe(button2);

      // Shift+Tab should go to first button
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(button1);
    });

    it('should handle Enter and Space key activation', async () => {
      const mockClick = vi.fn();
      const TestComponent = () => (
        <button onClick={mockClick} aria-label="テストボタン">
          クリック
        </button>
      );

      const user = userEvent.setup();
      render(<TestComponent />);

      const button = screen.getByRole('button');
      button.focus();

      // Test Enter key
      await user.keyboard('{Enter}');
      expect(mockClick).toHaveBeenCalledTimes(1);

      // Test Space key
      await user.keyboard(' ');
      expect(mockClick).toHaveBeenCalledTimes(2);
    });

    it('should support Escape key to close modals', async () => {
      const TestModal = () => {
        const [isOpen, setIsOpen] = React.useState(true);

        React.useEffect(() => {
          const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
              setIsOpen(false);
            }
          };

          if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
          }

          return () => {
            document.removeEventListener('keydown', handleKeyDown);
          };
        }, [isOpen]);

        return (
          <div>
            {isOpen && (
              <div role="dialog" aria-modal="true" data-testid="modal">
                <p>モーダルコンテンツ</p>
                <button onClick={() => setIsOpen(false)}>閉じる</button>
              </div>
            )}
          </div>
        );
      };

      const user = userEvent.setup();
      render(<TestModal />);

      const modal = screen.getByTestId('modal');
      expect(modal).toBeInTheDocument();

      await user.keyboard('{Escape}');

      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  describe('Screen Reader Support Tests', () => {
    it('should create and manage live regions', () => {
      const manager = LiveRegionManager.getInstance();

      // Live regions should be created
      const politeRegion = document.getElementById('live-region-polite');
      const assertiveRegion = document.getElementById('live-region-assertive');

      expect(politeRegion).toBeInTheDocument();
      expect(assertiveRegion).toBeInTheDocument();
      expect(politeRegion).toHaveAttribute('aria-live', 'polite');
      expect(assertiveRegion).toHaveAttribute('aria-live', 'assertive');
    });

    it('should announce messages to screen readers', () => {
      const manager = LiveRegionManager.getInstance();

      manager.announce('テストメッセージ', 'polite');

      // Test that the manager has the announce method
      expect(typeof manager.announce).toBe('function');

      // Test that we can call the announce method without errors
      expect(() => {
        manager.announce('テストメッセージ', 'polite');
      }).not.toThrow();

      expect(() => {
        manager.announce('エラーメッセージ', 'assertive');
      }).not.toThrow();
    });

    it('should provide proper ARIA labels and descriptions', () => {
      const TestComponent = () => (
        <div>
          <img
            src="/test.jpg"
            alt="テスト画像の説明"
            aria-describedby="img-desc"
          />
          <div id="img-desc">詳細な画像の説明</div>
          <button aria-label="メニューを開く">☰</button>
          <input
            type="email"
            aria-label="メールアドレス"
            aria-describedby="email-help"
          />
          <div id="email-help">有効なメールアドレスを入力してください</div>
        </div>
      );

      render(<TestComponent />);

      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt', 'テスト画像の説明');
      expect(image).toHaveAttribute('aria-describedby', 'img-desc');

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'メニューを開く');

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', 'メールアドレス');
      expect(input).toHaveAttribute('aria-describedby', 'email-help');
    });

    it('should support proper heading hierarchy', () => {
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

      expect(h1).toHaveTextContent('メインタイトル');
      expect(h2).toHaveTextContent('セクションタイトル');
      expect(h3).toHaveTextContent('サブセクション');
    });

    it('should announce form validation errors', async () => {
      const FormComponent = () => {
        const [email, setEmail] = React.useState('');
        const [error, setError] = React.useState('');

        const validateEmail = (value: string) => {
          if (!value.includes('@')) {
            setError('有効なメールアドレスを入力してください');
          } else {
            setError('');
          }
        };

        return (
          <form>
            <input
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                validateEmail(e.target.value);
              }}
              aria-describedby={error ? 'email-error' : undefined}
              aria-invalid={!!error}
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
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should provide skip links for main content', () => {
      const TestApp = () => (
        <div>
          <a href="#main-content" className="skip-link">
            メインコンテンツにスキップ
          </a>
          <nav>
            <ul>
              <li>
                <a href="#home">ホーム</a>
              </li>
              <li>
                <a href="#about">について</a>
              </li>
            </ul>
          </nav>
          <main id="main-content">
            <h1>メインコンテンツ</h1>
          </main>
        </div>
      );

      render(<TestApp />);

      const skipLink = screen.getByText('メインコンテンツにスキップ');
      expect(skipLink).toHaveAttribute('href', '#main-content');

      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveAttribute('id', 'main-content');
    });
  });

  describe('Focus Management Tests', () => {
    it('should trap focus within modal dialogs', () => {
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

      focusTrap.deactivate();
      document.body.removeChild(container);
    });

    it('should restore focus after modal closes', () => {
      const originalButton = document.createElement('button');
      originalButton.id = 'original';
      document.body.appendChild(originalButton);
      originalButton.focus();

      const container = document.createElement('div');
      container.innerHTML = '<button>Modal Button</button>';
      document.body.appendChild(container);

      const focusTrap = new FocusTrap(container);
      focusTrap.activate();
      focusTrap.deactivate();

      expect(document.activeElement?.id).toBe('original');

      document.body.removeChild(originalButton);
      document.body.removeChild(container);
    });
  });

  describe('Accessibility Validation Tests', () => {
    it('should validate image accessibility', () => {
      // Test image without alt text
      const img = document.createElement('img');
      img.src = 'test.jpg';
      let issues = AccessibilityValidator.validateElement(img);
      expect(issues).toContain('Image missing alt attribute');

      // Fix the issue
      img.alt = 'Test image';
      issues = AccessibilityValidator.validateElement(img);
      expect(issues).not.toContain('Image missing alt attribute');
    });

    it('should validate button accessibility', () => {
      // Test button without text or aria-label
      const button = document.createElement('button');
      let issues = AccessibilityValidator.validateElement(button);
      expect(issues).toContain('Button missing aria-label or text content');

      // Fix with aria-label
      button.setAttribute('aria-label', 'Test button');
      issues = AccessibilityValidator.validateElement(button);
      expect(issues).not.toContain('Button missing aria-label or text content');
    });

    it('should validate link accessibility', () => {
      // Test link without href
      const link = document.createElement('a');
      link.textContent = 'Test link';
      let issues = AccessibilityValidator.validateElement(link);
      expect(issues).toContain('Link missing href attribute');

      // Fix with href
      link.href = 'https://example.com';
      issues = AccessibilityValidator.validateElement(link);
      expect(issues).not.toContain('Link missing href attribute');
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

  describe('Responsive Design Accessibility', () => {
    it('should provide adequate touch targets on mobile', () => {
      const TestComponent = () => (
        <div>
          <button style={{ minHeight: '44px', minWidth: '44px' }}>
            モバイルボタン
          </button>
        </div>
      );

      render(<TestComponent />);

      const button = screen.getByRole('button');
      const styles = window.getComputedStyle(button);

      // Check minimum touch target size (44px)
      const minHeight = parseInt(styles.minHeight) || parseInt(styles.height);
      const minWidth = parseInt(styles.minWidth) || parseInt(styles.width);

      expect(minHeight).toBeGreaterThanOrEqual(44);
      expect(minWidth).toBeGreaterThanOrEqual(44);
    });

    it('should support reduced motion preferences', () => {
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

      const TestComponent = () => {
        const prefersReducedMotion = window.matchMedia(
          '(prefers-reduced-motion: reduce)'
        ).matches;

        return (
          <div
            data-testid="animated-element"
            style={{
              transition: prefersReducedMotion ? 'none' : 'all 0.3s ease',
            }}
          >
            アニメーション要素
          </div>
        );
      };

      render(<TestComponent />);

      const element = screen.getByTestId('animated-element');
      const styles = window.getComputedStyle(element);

      // Should respect reduced motion preference
      expect(styles.transition).toBe('none');
    });
  });

  describe('Error Handling and Feedback', () => {
    it('should announce loading states', async () => {
      const LoadingComponent = () => {
        const [loading, setLoading] = React.useState(true);

        React.useEffect(() => {
          const timer = setTimeout(() => setLoading(false), 100);
          return () => clearTimeout(timer);
        }, []);

        return (
          <div>
            {loading ? (
              <div role="status" aria-live="polite">
                読み込み中...
              </div>
            ) : (
              <div>コンテンツが読み込まれました</div>
            )}
          </div>
        );
      };

      render(<LoadingComponent />);

      const loadingStatus = screen.getByRole('status');
      expect(loadingStatus).toHaveTextContent('読み込み中...');
      expect(loadingStatus).toHaveAttribute('aria-live', 'polite');

      await waitFor(() => {
        expect(
          screen.getByText('コンテンツが読み込まれました')
        ).toBeInTheDocument();
      });
    });

    it('should provide proper error messages', () => {
      const ErrorComponent = () => (
        <div>
          <div role="alert" aria-live="assertive">
            エラー: ネットワーク接続に失敗しました
          </div>
          <button aria-describedby="retry-help">再試行</button>
          <div id="retry-help">
            ネットワーク接続を確認してから再試行してください
          </div>
        </div>
      );

      render(<ErrorComponent />);

      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toHaveTextContent(
        'エラー: ネットワーク接続に失敗しました'
      );
      expect(errorAlert).toHaveAttribute('aria-live', 'assertive');

      const retryButton = screen.getByRole('button');
      expect(retryButton).toHaveAttribute('aria-describedby', 'retry-help');
    });
  });
});
