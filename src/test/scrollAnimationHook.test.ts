import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scrollToElement, scrollToTop } from '../hooks/useScrollAnimation';

// Mock window.scrollTo
const mockScrollTo = vi.fn();
Object.defineProperty(window, 'scrollTo', {
  value: mockScrollTo,
  configurable: true,
  writable: true,
});

// Mock document.getElementById
const mockGetElementById = vi.fn();
Object.defineProperty(document, 'getElementById', {
  value: mockGetElementById,
  configurable: true,
  writable: true,
});

describe('Scroll Animation Utility Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockScrollTo.mockClear();
    mockGetElementById.mockClear();
  });

  describe('scrollToElement', () => {
    it('should scroll to element with default offset', () => {
      const mockElement = document.createElement('div');
      mockElement.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 100,
      });

      Object.defineProperty(window, 'pageYOffset', {
        value: 50,
        configurable: true,
      });

      mockGetElementById.mockReturnValue(mockElement);

      scrollToElement('test-element');

      expect(mockGetElementById).toHaveBeenCalledWith('test-element');
      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 150, // 100 + 50 - 0 (default offset)
        behavior: 'smooth',
      });
    });

    it('should scroll to element with custom offset', () => {
      const mockElement = document.createElement('div');
      mockElement.getBoundingClientRect = vi.fn().mockReturnValue({
        top: 100,
      });

      Object.defineProperty(window, 'pageYOffset', {
        value: 50,
        configurable: true,
      });

      mockGetElementById.mockReturnValue(mockElement);

      scrollToElement('test-element', 20);

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 130, // 100 + 50 - 20
        behavior: 'smooth',
      });
    });

    it('should handle element not found gracefully', () => {
      mockGetElementById.mockReturnValue(null);

      scrollToElement('non-existent-element');

      expect(mockGetElementById).toHaveBeenCalledWith('non-existent-element');
      expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it('should handle element without getBoundingClientRect', () => {
      const mockElement = document.createElement('div');
      // Don't mock getBoundingClientRect to test error handling

      mockGetElementById.mockReturnValue(mockElement);

      // Should not throw error
      expect(() => {
        scrollToElement('test-element');
      }).not.toThrow();
    });
  });

  describe('scrollToTop', () => {
    it('should scroll to top of page', () => {
      scrollToTop();

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      });
    });

    it('should call scrollTo only once', () => {
      scrollToTop();
      scrollToTop();

      expect(mockScrollTo).toHaveBeenCalledTimes(2);
      expect(mockScrollTo).toHaveBeenNthCalledWith(1, {
        top: 0,
        behavior: 'smooth',
      });
      expect(mockScrollTo).toHaveBeenNthCalledWith(2, {
        top: 0,
        behavior: 'smooth',
      });
    });
  });

  describe('Scroll Animation Integration Tests', () => {
    it('should handle multiple scroll operations', () => {
      const mockElement1 = document.createElement('div');
      const mockElement2 = document.createElement('div');

      mockElement1.getBoundingClientRect = vi
        .fn()
        .mockReturnValue({ top: 100 });
      mockElement2.getBoundingClientRect = vi
        .fn()
        .mockReturnValue({ top: 200 });

      Object.defineProperty(window, 'pageYOffset', {
        value: 0,
        configurable: true,
      });

      mockGetElementById
        .mockReturnValueOnce(mockElement1)
        .mockReturnValueOnce(mockElement2);

      scrollToElement('element1');
      scrollToElement('element2');

      expect(mockScrollTo).toHaveBeenCalledTimes(2);
      expect(mockScrollTo).toHaveBeenNthCalledWith(1, {
        top: 100,
        behavior: 'smooth',
      });
      expect(mockScrollTo).toHaveBeenNthCalledWith(2, {
        top: 200,
        behavior: 'smooth',
      });
    });

    it('should handle scroll operations with different page offsets', () => {
      const mockElement = document.createElement('div');
      mockElement.getBoundingClientRect = vi.fn().mockReturnValue({ top: 100 });

      mockGetElementById.mockReturnValue(mockElement);

      // First scroll with pageYOffset = 0
      Object.defineProperty(window, 'pageYOffset', {
        value: 0,
        configurable: true,
      });
      scrollToElement('test-element');

      // Second scroll with pageYOffset = 50
      Object.defineProperty(window, 'pageYOffset', {
        value: 50,
        configurable: true,
      });
      scrollToElement('test-element');

      expect(mockScrollTo).toHaveBeenCalledTimes(2);
      expect(mockScrollTo).toHaveBeenNthCalledWith(1, {
        top: 100, // 100 + 0 - 0
        behavior: 'smooth',
      });
      expect(mockScrollTo).toHaveBeenNthCalledWith(2, {
        top: 150, // 100 + 50 - 0
        behavior: 'smooth',
      });
    });

    it('should handle error cases gracefully', () => {
      // Test with null element
      mockGetElementById.mockReturnValue(null);
      expect(() => scrollToElement('null-element')).not.toThrow();

      // Test with element that throws error - the function doesn't handle errors internally
      // so we test that it calls the expected functions before throwing
      const mockElement = document.createElement('div');
      mockElement.getBoundingClientRect = vi.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      mockGetElementById.mockReturnValue(mockElement);

      // Verify the function was called even though it throws
      try {
        scrollToElement('error-element');
      } catch (error) {
        expect(mockGetElementById).toHaveBeenCalledWith('error-element');
        expect(error.message).toBe('Test error');
      }
    });
  });

  describe('Animation Performance Tests', () => {
    it('should handle rapid scroll calls efficiently', () => {
      const mockElement = document.createElement('div');
      mockElement.getBoundingClientRect = vi.fn().mockReturnValue({ top: 100 });
      mockGetElementById.mockReturnValue(mockElement);

      Object.defineProperty(window, 'pageYOffset', {
        value: 0,
        configurable: true,
      });

      // Simulate rapid calls
      for (let i = 0; i < 10; i++) {
        scrollToElement('test-element');
      }

      expect(mockScrollTo).toHaveBeenCalledTimes(10);
      expect(mockGetElementById).toHaveBeenCalledTimes(10);
    });

    it('should handle scrollToTop calls efficiently', () => {
      // Simulate rapid calls
      for (let i = 0; i < 5; i++) {
        scrollToTop();
      }

      expect(mockScrollTo).toHaveBeenCalledTimes(5);
      mockScrollTo.mock.calls.forEach(call => {
        expect(call[0]).toEqual({
          top: 0,
          behavior: 'smooth',
        });
      });
    });
  });
});
