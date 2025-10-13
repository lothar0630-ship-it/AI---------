import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import NotFoundPage from '../components/NotFoundPage';

describe('NotFoundPage', () => {
  let mockGoHome: any;

  beforeEach(() => {
    mockGoHome = vi.fn();

    // Mock window.location.href
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });

    // Mock window.history.back
    Object.defineProperty(window, 'history', {
      value: { back: vi.fn() },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders 404 error message', () => {
    render(<NotFoundPage />);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('ページが見つかりません')).toBeInTheDocument();
    expect(
      screen.getByText(/お探しのページは存在しないか/)
    ).toBeInTheDocument();
  });

  it('displays helpful suggestions', () => {
    render(<NotFoundPage />);

    expect(screen.getByText('以下をお試しください:')).toBeInTheDocument();
    expect(
      screen.getByText(/URLが正しく入力されているか確認してください/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/ブラウザの戻るボタンで前のページに戻る/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/ホームページから目的のコンテンツを探す/)
    ).toBeInTheDocument();
  });

  it('calls onGoHome when home button is clicked', () => {
    render(<NotFoundPage onGoHome={mockGoHome} />);

    const homeButton = screen.getByText('ホームページに戻る');
    fireEvent.click(homeButton);

    expect(mockGoHome).toHaveBeenCalled();
  });

  it('redirects to home when no onGoHome callback provided', () => {
    render(<NotFoundPage />);

    const homeButton = screen.getByText('ホームページに戻る');
    fireEvent.click(homeButton);

    expect(window.location.href).toBe('/');
  });

  it('calls window.history.back when back button is clicked', () => {
    render(<NotFoundPage />);

    const backButton = screen.getByText('前のページに戻る');
    fireEvent.click(backButton);

    expect(window.history.back).toHaveBeenCalled();
  });

  it('displays footer message', () => {
    render(<NotFoundPage />);

    expect(
      screen.getByText(
        'それでも問題が解決しない場合は、しばらく時間をおいてから再度アクセスしてください。'
      )
    ).toBeInTheDocument();
  });

  it('has proper styling classes', () => {
    const { container } = render(<NotFoundPage />);

    const mainContainer = container.querySelector('.min-h-screen');
    expect(mainContainer).toHaveClass(
      'min-h-screen',
      'bg-white',
      'flex',
      'items-center',
      'justify-center',
      'p-4'
    );
  });

  it('displays 404 number with proper styling', () => {
    render(<NotFoundPage />);

    const errorNumber = screen.getByText('404');
    expect(errorNumber).toHaveClass(
      'text-8xl',
      'font-bold',
      'text-primary',
      'mb-4'
    );
  });

  it('displays home icon in home button', () => {
    const { container } = render(<NotFoundPage />);

    const homeButton = screen.getByText('ホームページに戻る');
    const homeIcon = homeButton.querySelector('svg');

    expect(homeIcon).toBeInTheDocument();
    expect(homeIcon).toHaveClass('w-5', 'h-5');
  });

  it('displays back icon in back button', () => {
    const { container } = render(<NotFoundPage />);

    const backButton = screen.getByText('前のページに戻る');
    const backIcon = backButton.querySelector('svg');

    expect(backIcon).toBeInTheDocument();
    expect(backIcon).toHaveClass('w-5', 'h-5');
  });

  it('has proper button styling', () => {
    render(<NotFoundPage />);

    const homeButton = screen.getByText('ホームページに戻る');
    const backButton = screen.getByText('前のページに戻る');

    expect(homeButton).toHaveClass('w-full', 'bg-primary', 'text-white');
    expect(backButton).toHaveClass(
      'w-full',
      'bg-secondary-100',
      'text-secondary-700'
    );
  });

  it('displays suggestions in proper container', () => {
    const { container } = render(<NotFoundPage />);

    const suggestionsContainer = container.querySelector('.bg-secondary-50');
    expect(suggestionsContainer).toHaveClass(
      'bg-secondary-50',
      'rounded-xl',
      'p-6',
      'mb-8'
    );
  });
});
