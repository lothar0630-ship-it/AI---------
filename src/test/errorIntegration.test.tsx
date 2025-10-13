import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from '../components/ErrorBoundary';
import { globalErrorHandler } from '../utils/errorHandler';
import React from 'react';

// Mock components for testing error scenarios
const ComponentWithApiError: React.FC = () => {
  React.useEffect(() => {
    // Simulate API error
    const apiError = new Error('API request failed');
    globalErrorHandler.logError(apiError, { context: 'API call' });
  }, []);

  return <div>Component with API error</div>;
};

const ComponentWithAsyncError: React.FC = () => {
  React.useEffect(() => {
    // Simulate async error
    Promise.reject(new Error('Async operation failed')).catch(error => {
      globalErrorHandler.logError(error, { context: 'Async operation' });
    });
  }, []);

  return <div>Component with async error</div>;
};

const ComponentThatThrows: React.FC = () => {
  throw new Error('Component render error');
};

describe('Error Integration Tests', () => {
  let queryClient: QueryClient;
  let consoleSpy: any;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    globalErrorHandler.clearErrorHistory();
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('handles API errors gracefully', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <ComponentWithApiError />
        </ErrorBoundary>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const errorHistory = globalErrorHandler.getErrorHistory();
      expect(errorHistory).toHaveLength(1);
      expect(errorHistory[0].message).toBe('API request failed');
    });

    // Component should still render normally
    expect(screen.getByText('Component with API error')).toBeInTheDocument();
  });

  it('handles async errors gracefully', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <ComponentWithAsyncError />
        </ErrorBoundary>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const errorHistory = globalErrorHandler.getErrorHistory();
      expect(errorHistory).toHaveLength(1);
      expect(errorHistory[0].message).toBe('Async operation failed');
    });

    // Component should still render normally
    expect(screen.getByText('Component with async error')).toBeInTheDocument();
  });

  it('catches component render errors with ErrorBoundary', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <ComponentThatThrows />
        </ErrorBoundary>
      </QueryClientProvider>
    );

    // ErrorBoundary should catch the error and show error UI
    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
    expect(screen.queryByText('Component that throws')).not.toBeInTheDocument();
  });

  it('handles multiple errors in sequence', async () => {
    const MultiErrorComponent: React.FC = () => {
      React.useEffect(() => {
        // Log multiple errors
        globalErrorHandler.logError('First error');
        globalErrorHandler.logError('Second error');
        globalErrorHandler.logError('Third error');
      }, []);

      return <div>Multi error component</div>;
    };

    render(
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <MultiErrorComponent />
        </ErrorBoundary>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const errorHistory = globalErrorHandler.getErrorHistory();
      expect(errorHistory).toHaveLength(3);
      expect(errorHistory[0].message).toBe('First error');
      expect(errorHistory[1].message).toBe('Second error');
      expect(errorHistory[2].message).toBe('Third error');
    });
  });

  it('maintains error history across component updates', async () => {
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <ComponentWithApiError />
        </ErrorBoundary>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(globalErrorHandler.getErrorHistory()).toHaveLength(1);
    });

    // Re-render with different component
    rerender(
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <ComponentWithAsyncError />
        </ErrorBoundary>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const errorHistory = globalErrorHandler.getErrorHistory();
      expect(errorHistory).toHaveLength(2);
    });
  });

  it('handles error boundary retry with recovered component', () => {
    let shouldThrow = true;

    const ConditionalErrorComponent: React.FC = () => {
      if (shouldThrow) {
        throw new Error('Conditional error');
      }
      return <div>Component recovered</div>;
    };

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <ConditionalErrorComponent />
        </ErrorBoundary>
      </QueryClientProvider>
    );

    // Should show error UI
    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();

    // Fix the component and retry
    shouldThrow = false;
    const retryButton = screen.getByText('もう一度試す');
    fireEvent.click(retryButton);

    rerender(
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <ConditionalErrorComponent />
        </ErrorBoundary>
      </QueryClientProvider>
    );

    expect(screen.getByText('Component recovered')).toBeInTheDocument();
  });

  it('handles nested error boundaries', () => {
    const InnerErrorComponent: React.FC = () => {
      throw new Error('Inner component error');
    };

    const OuterComponent: React.FC = () => (
      <div>
        <div>Outer component content</div>
        <ErrorBoundary fallback={<div>Inner error caught</div>}>
          <InnerErrorComponent />
        </ErrorBoundary>
      </div>
    );

    render(
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <OuterComponent />
        </ErrorBoundary>
      </QueryClientProvider>
    );

    // Inner error boundary should catch the error
    expect(screen.getByText('Outer component content')).toBeInTheDocument();
    expect(screen.getByText('Inner error caught')).toBeInTheDocument();
    expect(screen.queryByText('エラーが発生しました')).not.toBeInTheDocument();
  });

  it('logs errors with proper context information', async () => {
    const ContextualErrorComponent: React.FC = () => {
      React.useEffect(() => {
        globalErrorHandler.logError('Contextual error', {
          component: 'ContextualErrorComponent',
          userId: 'test-user-123',
          timestamp: Date.now(),
        });
      }, []);

      return <div>Contextual error component</div>;
    };

    render(
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <ContextualErrorComponent />
        </ErrorBoundary>
      </QueryClientProvider>
    );

    await waitFor(() => {
      const errorHistory = globalErrorHandler.getErrorHistory();
      expect(errorHistory).toHaveLength(1);
      expect(errorHistory[0]).toMatchObject({
        message: 'Contextual error',
        component: 'ContextualErrorComponent',
        userId: 'test-user-123',
      });
    });
  });
});
