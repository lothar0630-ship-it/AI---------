import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  useScrollAnimation,
  useParallaxScroll,
  useScrollDirection,
  scrollToElement,
  scrollToTop,
} from '../hooks/useScrollAnimation';

// Mock Intersection Observer
const mockIntersectionObserver = vi.fn();
const mockObserve = vi.fn();
const mockUnobserve = vi.fn();
const mockDisconnect = vi.fn();

mockIntersectionObserver.mockImplementation(callback => {
  return {
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
    callback,
  };
});

Object.defineProperty(window, 'IntersectionObserver', {
  value: mockIntersectionObserver,
  configurable: true,
  writable: true,
});

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

describe('useScrollAnimation Hook Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIntersectionObserver.mockClear();
    mockObserve.mockClear();
    mockUnobserve.mockClear();
    mockDisconnect.mockClear();
    mockScrollTo.mockClear();
    mockGetElementById.mockClear();

    // Reset window properties
    Object.defineProperty(window, 'pageYOffset', {
      value: 0,
      configurable: true,
      writable: true,
    });

    Object.defineProperty(window, 'scrollY', {
      value: 0,
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useScrollAnimation', () => {
    it('should initialize with default options', () => {
      const { result } = renderHook(() => useScrollAnimation());

      expect(result.current.isVisible).toBe(false);
      expect(result.current.elementRef.current).toBe(null);
      expect(mockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px',
        }
      );
    });

    it('should initialize with custom options', () => {
      const customOptions = {
        threshold: 0.5,
        rootMargin: '10px',
        triggerOnce: false,
      };

      renderHook(() => useScrollAnimation(customOptions));

      expect(mockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        {
          threshold: 0.5,
          rootMargin: '10px',
        }
      );
    });

    it('should observe element when ref is set', () => {
      const { result } = renderHook(() => useScrollAnimation());

      // Mock element
      const mockElement = document.createElement('div');

      act(() => {
        result.current.elementRef.current = mockElement;
      });

      // Re-render to trigger useEffect
      const { rerender } = renderHook(() => useScrollAnimation());
      rerender();

      expect(mockObserve).toHaveBeenCalledWith(mockElement);
    });

    it('should handle intersection changes', () => {
      let intersectionCallback: (entries: IntersectionObserverEntry[]) => void;

      mockIntersectionObserver.mockImplementation(callback => {
        intersectionCallback = callback;
        return {
          observe: mockObserve,
          unobserve: mockUnobserve,
          disconnect: mockDisconnect,
        };
      });

      const { result } = renderHook(() => useScrollAnimation());

      // Simulate intersection
      act(() => {
        intersectionCallback([
          {
            isIntersecting: true,
            target: document.createElement('div'),
          } as IntersectionObserverEntry,
        ]);
      });

      expect(result.current.isVisible).toBe(true);
    });

    it('should handle triggerOnce option', () => {
      let intersectionCallback: (entries: IntersectionObserverEntry[]) => void;
      const mockElement = document.createElement('div');

      mockIntersectionObserver.mockImplementation(callback => {
        intersectionCallback = callback;
        return {
          observe: mockObserve,
          unobserve: mockUnobserve,
          disconnect: mockDisconnect,
        };
      });

      const { result } = renderHook(() =>
        useScrollAnimation({ triggerOnce: true })
      );

      act(() => {
        result.current.elementRef.current = mockElement;
      });

      // Simulate intersection
      act(() => {
        intersectionCallback([
          {
            isIntersecting: true,
            target: mockElement,
          } as IntersectionObserverEntry,
        ]);
      });

      expect(result.current.isVisible).toBe(true);
      expect(mockUnobserve).toHaveBeenCalledWith(mockElement);
    });

    it('should handle triggerOnce false', () => {
      let intersectionCallback: (entries: IntersectionObserverEntry[]) => void;

      mockIntersectionObserver.mockImplementation(callback => {
        intersectionCallback = callback;
        return {
          observe: mockObserve,
          unobserve: mockUnobserve,
          disconnect: mockDisconnect,
        };
      });

      const { result } = renderHook(() =>
        useScrollAnimation({ triggerOnce: false })
      );

      // Simulate intersection
      act(() => {
        intersectionCallback([
          {
            isIntersecting: true,
            target: document.createElement('div'),
          } as IntersectionObserverEntry,
        ]);
      });

      expect(result.current.isVisible).toBe(true);

      // Simulate leaving intersection
      act(() => {
        intersectionCallback([
          {
            isIntersecting: false,
            target: document.createElement('div'),
          } as IntersectionObserverEntry,
        ]);
      });

      expect(result.current.isVisible).toBe(false);
    });

    it('should cleanup on unmount', () => {
      const mockElement = document.createElement('div');

      const { result, unmount } = renderHook(() => useScrollAnimation());

      act(() => {
        result.current.elementRef.current = mockElement;
      });

      unmount();

      expect(mockUnobserve).toHaveBeenCalledWith(mockElement);
    });
  });

  describe('useParallaxScroll', () => {
    it('should initialize with default speed', () => {
      const { result } = renderHook(() => useParallaxScroll());
      expect(result.current).toBe(0);
    });

    it('should calculate offset based on scroll position and speed', () => {
      const { result } = renderHook(() => useParallaxScroll(0.5));

      // Mock scroll position
      Object.defineProperty(window, 'pageYOffset', {
        value: 100,
        configurable: true,
      });

      // Simulate scroll event
      act(() => {
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current).toBe(50); // 100 * 0.5
    });

    it('should handle custom speed values', () => {
      const { result } = renderHook(() => useParallaxScroll(0.2));

      Object.defineProperty(window, 'pageYOffset', {
        value: 200,
        configurable: true,
      });

      act(() => {
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current).toBe(40); // 200 * 0.2
    });

    it('should cleanup scroll listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useParallaxScroll());
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function)
      );
    });
  });

  describe('useScrollDirection', () => {
    it('should initialize with null direction', () => {
      const { result } = renderHook(() => useScrollDirection());
      expect(result.current).toBe(null);
    });

    it('should detect scroll down', () => {
      const { result } = renderHook(() => useScrollDirection());

      // Simulate scroll down
      Object.defineProperty(window, 'scrollY', {
        value: 100,
        configurable: true,
      });

      act(() => {
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current).toBe('down');
    });

    it('should detect scroll up', () => {
      const { result } = renderHook(() => useScrollDirection());

      // First scroll down
      Object.defineProperty(window, 'scrollY', {
        value: 100,
        configurable: true,
      });

      act(() => {
        window.dispatchEvent(new Event('scroll'));
      });

      // Then scroll up
      Object.defineProperty(window, 'scrollY', {
        value: 50,
        configurable: true,
      });

      act(() => {
        window.dispatchEvent(new Event('scroll'));
      });

      expect(result.current).toBe('up');
    });

    it('should cleanup scroll listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() => useScrollDirection());
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'scroll',
        expect.any(Function)
      );
    });
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

    it('should handle element not found', () => {
      mockGetElementById.mockReturnValue(null);

      scrollToElement('non-existent-element');

      expect(mockGetElementById).toHaveBeenCalledWith('non-existent-element');
      expect(mockScrollTo).not.toHaveBeenCalled();
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
  });

  describe('Animation Performance Tests', () => {
    it('should handle multiple rapid scroll events', () => {
      const { result } = renderHook(() => useParallaxScroll(0.5));

      // Simulate rapid scroll events
      for (let i = 0; i < 10; i++) {
        Object.defineProperty(window, 'pageYOffset', {
          value: i * 10,
          configurable: true,
        });

        act(() => {
          window.dispatchEvent(new Event('scroll'));
        });
      }

      expect(result.current).toBe(45); // 90 * 0.5
    });

    it('should handle intersection observer with multiple entries', () => {
      let intersectionCallback: (entries: IntersectionObserverEntry[]) => void;

      mockIntersectionObserver.mockImplementation(callback => {
        intersectionCallback = callback;
        return {
          observe: mockObserve,
          unobserve: mockUnobserve,
          disconnect: mockDisconnect,
        };
      });

      const { result } = renderHook(() => useScrollAnimation());

      // Simulate multiple entries
      act(() => {
        intersectionCallback([
          {
            isIntersecting: true,
            target: document.createElement('div'),
          } as IntersectionObserverEntry,
          {
            isIntersecting: false,
            target: document.createElement('div'),
          } as IntersectionObserverEntry,
        ]);
      });

      expect(result.current.isVisible).toBe(true);
    });
  });
});
