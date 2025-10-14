// Global error handling utilities

export interface ErrorDetails {
  message: string;
  stack?: string;
  timestamp: number;
  url: string;
  userAgent: string;
  userId?: string;
}

export interface ErrorHandlerConfig {
  enableLogging: boolean;
  enableReporting: boolean;
  maxErrors: number;
  reportingEndpoint?: string;
}

class GlobalErrorHandler {
  private config: ErrorHandlerConfig;
  private errorQueue: ErrorDetails[] = [];

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = {
      enableLogging: true,
      enableReporting: false,
      maxErrors: 50,
      ...config,
    };

    this.setupGlobalHandlers();
  }

  private setupGlobalHandlers() {
    // Handle uncaught JavaScript errors
    window.addEventListener('error', event => {
      this.handleError({
        message: event.message,
        stack: event.error?.stack,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', event => {
      this.handleError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
    });
  }

  private handleError(errorDetails: ErrorDetails) {
    // Add to error queue
    this.errorQueue.push(errorDetails);

    // Maintain queue size
    if (this.errorQueue.length > this.config.maxErrors) {
      this.errorQueue.shift();
    }

    // Log to console if enabled
    if (this.config.enableLogging) {
      console.error('Global Error Handler:', errorDetails);
    }

    // Report error if enabled
    if (this.config.enableReporting && this.config.reportingEndpoint) {
      this.reportError(errorDetails);
    }
  }

  private async reportError(errorDetails: ErrorDetails) {
    try {
      await fetch(this.config.reportingEndpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorDetails),
      });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  // Public methods
  public logError(error: Error | string, context?: Record<string, any>) {
    const errorDetails: ErrorDetails = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...context,
    };

    this.handleError(errorDetails);
  }

  public getErrorHistory(): ErrorDetails[] {
    return [...this.errorQueue];
  }

  public clearErrorHistory() {
    this.errorQueue = [];
  }

  public updateConfig(newConfig: Partial<ErrorHandlerConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}

// Create singleton instance
export const globalErrorHandler = new GlobalErrorHandler({
  enableLogging: import.meta.env.DEV,
  enableReporting: import.meta.env.PROD,
  maxErrors: 100,
});

// Utility functions for common error scenarios
export const handleApiError = (error: any, context?: string) => {
  const message =
    error?.response?.data?.message || error?.message || 'API request failed';
  globalErrorHandler.logError(
    new Error(`API Error${context ? ` (${context})` : ''}: ${message}`),
    {
      apiContext: context,
      statusCode: error?.response?.status,
      endpoint: error?.config?.url,
    }
  );
};

export const handleAsyncError = async <T>(
  asyncFn: () => Promise<T>,
  fallbackValue?: T,
  context?: string
): Promise<T | undefined> => {
  try {
    return await asyncFn();
  } catch (error) {
    globalErrorHandler.logError(
      error instanceof Error ? error : new Error(String(error)),
      { asyncContext: context }
    );
    return fallbackValue;
  }
};

export const withErrorBoundary = <T extends (...args: any[]) => any>(
  fn: T,
  context?: string
): T => {
  return ((...args: any[]) => {
    try {
      const result = fn(...args);

      // Handle async functions
      if (result instanceof Promise) {
        return result.catch(error => {
          globalErrorHandler.logError(
            error instanceof Error ? error : new Error(String(error)),
            { functionContext: context }
          );
          throw error;
        });
      }

      return result;
    } catch (error) {
      globalErrorHandler.logError(
        error instanceof Error ? error : new Error(String(error)),
        { functionContext: context }
      );
      throw error;
    }
  }) as T;
};

// React-specific error utilities
export const getErrorFallbackMessage = (componentName: string) => {
  return `${componentName} の読み込み中にエラーが発生しました。`;
};
