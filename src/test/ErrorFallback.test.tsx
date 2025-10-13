import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorFallback from '../components/ErrorFallback';

describe('ErrorFallback', () => {
  it('renders component name and error message', () => {
    render(<ErrorFallback componentName="TestComponent" />);

    expect(screen.getByText('コンポーネントエラー')).toBeInTheDocument();
    expect(
      screen.getByText('TestComponent の読み込み中にエラーが発生しました。')
    ).toBeInTheDocument();
  });

  it('shows error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const testError = new Error('Test error message');
    testError.stack = 'Error stack trace';

    render(<ErrorFallback componentName="TestComponent" error={testError} />);

    expect(screen.getByText('エラー詳細 (開発環境のみ)')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('hides error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const testError = new Error('Test error message');

    render(<ErrorFallback componentName="TestComponent" error={testError} />);

    expect(
      screen.queryByText('エラー詳細 (開発環境のみ)')
    ).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('renders retry button when onRetry is provided', () => {
    const mockRetry = vi.fn();

    render(<ErrorFallback componentName="TestComponent" onRetry={mockRetry} />);

    const retryButton = screen.getByText('再試行');
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(mockRetry).toHaveBeenCalled();
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorFallback componentName="TestComponent" />);

    expect(screen.queryByText('再試行')).not.toBeInTheDocument();
  });

  it('has proper styling classes', () => {
    const { container } = render(
      <ErrorFallback componentName="TestComponent" />
    );

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass(
      'p-4',
      'bg-red-50',
      'border',
      'border-red-200',
      'rounded-lg'
    );
  });

  it('displays error message and stack in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const testError = new Error('Test error message');
    testError.stack = 'at TestComponent\n  at App';

    render(<ErrorFallback componentName="TestComponent" error={testError} />);

    // Click on details to expand
    const detailsElement = screen.getByText('エラー詳細 (開発環境のみ)');
    fireEvent.click(detailsElement);

    expect(screen.getByText(/Test error message/)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });
});
