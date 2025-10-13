import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  globalErrorHandler,
  handleApiError,
  handleAsyncError,
  withErrorBoundary,
  getErrorFallbackMessage,
} from '../utils/errorHandler';

describe('GlobalErrorHandler', () => {
  beforeEach(() => {
    globalErrorHandler.clearErrorHistory();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs errors to error history', () => {
    const testError = new Error('Test error');

    globalErrorHandler.logError(testError);

    const history = globalErrorHandler.getErrorHistory();
    expect(history).toHaveLength(1);
    expect(history[0].message).toBe('Test error');
  });

  it('logs string errors', () => {
    globalErrorHandler.logError('String error message');

    const history = globalErrorHandler.getErrorHistory();
    expect(history).toHaveLength(1);
    expect(history[0].message).toBe('String error message');
  });

  it('includes context in error details', () => {
    const testError = new Error('Test error');
    const context = { component: 'TestComponent', action: 'testAction' };

    globalErrorHandler.logError(testError, context);

    const history = globalErrorHandler.getErrorHistory();
    expect(history[0]).toMatchObject(context);
  });

  it('clears error history', () => {
    globalErrorHandler.logError('Test error');
    expect(globalErrorHandler.getErrorHistory()).toHaveLength(1);

    globalErrorHandler.clearErrorHistory();
    expect(globalErrorHandler.getErrorHistory()).toHaveLength(0);
  });

  it('maintains maximum error count', () => {
    globalErrorHandler.updateConfig({ maxErrors: 2 });

    globalErrorHandler.logError('Error 1');
    globalErrorHandler.logError('Error 2');
    globalErrorHandler.logError('Error 3');

    const history = globalErrorHandler.getErrorHistory();
    expect(history).toHaveLength(2);
    expect(history[0].message).toBe('Error 2');
    expect(history[1].message).toBe('Error 3');
  });
});

describe('handleApiError', () => {
  it('logs API errors with context', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    globalErrorHandler.clearErrorHistory(); // Clear before test

    const apiError = {
      response: {
        status: 404,
        data: { message: 'Not found' },
      },
      config: {
        url: '/api/test',
      },
    };

    handleApiError(apiError, 'test context');

    const history = globalErrorHandler.getErrorHistory();
    expect(history).toHaveLength(1);
    expect(history[0].message).toContain('API Error (test context): Not found');

    consoleSpy.mockRestore();
  });

  it('handles errors without response data', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    globalErrorHandler.clearErrorHistory(); // Clear before test

    const simpleError = new Error('Network error');

    handleApiError(simpleError);

    const history = globalErrorHandler.getErrorHistory();
    expect(history).toHaveLength(1);
    expect(history[0].message).toContain('API Error: Network error');

    consoleSpy.mockRestore();
  });
});

describe('handleAsyncError', () => {
  it('returns result when no error occurs', async () => {
    const asyncFn = async () => 'success';

    const result = await handleAsyncError(asyncFn);

    expect(result).toBe('success');
  });

  it('returns fallback value when error occurs', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    globalErrorHandler.clearErrorHistory(); // Clear before test

    const asyncFn = async () => {
      throw new Error('Async error');
    };

    const result = await handleAsyncError(asyncFn, 'fallback');

    expect(result).toBe('fallback');

    const history = globalErrorHandler.getErrorHistory();
    expect(history).toHaveLength(1);
    expect(history[0].message).toBe('Async error');

    consoleSpy.mockRestore();
  });

  it('returns undefined when no fallback provided', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const asyncFn = async () => {
      throw new Error('Async error');
    };

    const result = await handleAsyncError(asyncFn);

    expect(result).toBeUndefined();

    consoleSpy.mockRestore();
  });
});

describe('withErrorBoundary', () => {
  it('wraps function and logs errors', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    globalErrorHandler.clearErrorHistory(); // Clear before test

    const throwingFn = () => {
      throw new Error('Function error');
    };

    const wrappedFn = withErrorBoundary(throwingFn, 'test context');

    expect(() => wrappedFn()).toThrow('Function error');

    const history = globalErrorHandler.getErrorHistory();
    expect(history).toHaveLength(1);
    expect(history[0].message).toBe('Function error');

    consoleSpy.mockRestore();
  });

  it('handles async functions', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    globalErrorHandler.clearErrorHistory(); // Clear before test

    const throwingAsyncFn = async () => {
      throw new Error('Async function error');
    };

    const wrappedFn = withErrorBoundary(throwingAsyncFn, 'async context');

    await expect(wrappedFn()).rejects.toThrow('Async function error');

    const history = globalErrorHandler.getErrorHistory();
    expect(history).toHaveLength(1);
    expect(history[0].message).toBe('Async function error');

    consoleSpy.mockRestore();
  });
});

describe('getErrorFallbackMessage', () => {
  it('creates error fallback message', () => {
    const message = getErrorFallbackMessage('TestComponent');

    expect(message).toBe('TestComponent の読み込み中にエラーが発生しました。');
  });
});
