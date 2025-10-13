/**
 * Accessibility helper utilities for the personal portal site
 * Provides functions to enhance keyboard navigation and screen reader support
 */

/**
 * Manages focus trap for modal dialogs and mobile menus
 */
export class FocusTrap {
  private focusableElements: HTMLElement[] = [];
  private firstElement: HTMLElement | null = null;
  private lastElement: HTMLElement | null = null;
  private previousActiveElement: HTMLElement | null = null;

  constructor(private container: HTMLElement) {
    this.updateFocusableElements();
  }

  private updateFocusableElements() {
    const focusableSelectors = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    this.focusableElements = Array.from(
      this.container.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];

    this.firstElement = this.focusableElements[0] || null;
    this.lastElement =
      this.focusableElements[this.focusableElements.length - 1] || null;
  }

  activate() {
    this.previousActiveElement = document.activeElement as HTMLElement;
    this.updateFocusableElements();

    if (this.firstElement) {
      this.firstElement.focus();
    }

    document.addEventListener('keydown', this.handleKeyDown);
  }

  deactivate() {
    document.removeEventListener('keydown', this.handleKeyDown);

    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
    }
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    if (event.shiftKey) {
      if (document.activeElement === this.firstElement) {
        event.preventDefault();
        this.lastElement?.focus();
      }
    } else {
      if (document.activeElement === this.lastElement) {
        event.preventDefault();
        this.firstElement?.focus();
      }
    }
  };
}

/**
 * Announces messages to screen readers
 */
export class ScreenReaderAnnouncer {
  private static instance: ScreenReaderAnnouncer;
  private announceElement: HTMLElement | null = null;

  static getInstance(): ScreenReaderAnnouncer {
    if (!ScreenReaderAnnouncer.instance) {
      ScreenReaderAnnouncer.instance = new ScreenReaderAnnouncer();
    }
    return ScreenReaderAnnouncer.instance;
  }

  private constructor() {
    this.createAnnounceElement();
  }

  private createAnnounceElement() {
    this.announceElement = document.createElement('div');
    this.announceElement.setAttribute('aria-live', 'polite');
    this.announceElement.setAttribute('aria-atomic', 'true');
    this.announceElement.className = 'sr-only';
    document.body.appendChild(this.announceElement);
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (!this.announceElement) {
      this.createAnnounceElement();
    }

    if (this.announceElement) {
      this.announceElement.setAttribute('aria-live', priority);
      this.announceElement.textContent = message;

      // Clear the message after a short delay to allow for re-announcements
      setTimeout(() => {
        if (this.announceElement) {
          this.announceElement.textContent = '';
        }
      }, 1000);
    }
  }
}

/**
 * Keyboard navigation utilities
 */
export const KeyboardNavigation = {
  /**
   * Handles arrow key navigation for grid layouts
   */
  handleGridNavigation: (
    event: KeyboardEvent,
    currentIndex: number,
    totalItems: number,
    columnsPerRow: number,
    onNavigate: (newIndex: number) => void
  ) => {
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
        newIndex = Math.min(currentIndex + 1, totalItems - 1);
        break;
      case 'ArrowLeft':
        newIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'ArrowDown':
        newIndex = Math.min(currentIndex + columnsPerRow, totalItems - 1);
        break;
      case 'ArrowUp':
        newIndex = Math.max(currentIndex - columnsPerRow, 0);
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = totalItems - 1;
        break;
      default:
        return;
    }

    if (newIndex !== currentIndex) {
      event.preventDefault();
      onNavigate(newIndex);
    }
  },

  /**
   * Handles list navigation with arrow keys
   */
  handleListNavigation: (
    event: KeyboardEvent,
    currentIndex: number,
    totalItems: number,
    onNavigate: (newIndex: number) => void
  ) => {
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        newIndex = Math.min(currentIndex + 1, totalItems - 1);
        break;
      case 'ArrowUp':
        newIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = totalItems - 1;
        break;
      default:
        return;
    }

    if (newIndex !== currentIndex) {
      event.preventDefault();
      onNavigate(newIndex);
    }
  },
};

/**
 * Accessibility validation utilities
 */
export const AccessibilityValidator = {
  /**
   * Checks if an element has proper accessibility attributes
   */
  validateElement: (element: HTMLElement): string[] => {
    const issues: string[] = [];

    // Check for missing alt text on images
    if (element.tagName === 'IMG' && !element.getAttribute('alt')) {
      issues.push('Image missing alt attribute');
    }

    // Check for missing aria-label on buttons without text content
    if (
      element.tagName === 'BUTTON' &&
      !element.textContent?.trim() &&
      !element.getAttribute('aria-label')
    ) {
      issues.push('Button missing aria-label or text content');
    }

    // Check for missing href on links
    if (element.tagName === 'A' && !element.getAttribute('href')) {
      issues.push('Link missing href attribute');
    }

    // Check for proper heading hierarchy
    if (element.tagName.match(/^H[1-6]$/)) {
      const level = parseInt(element.tagName.charAt(1));
      const previousHeading =
        element.previousElementSibling?.tagName.match(/^H[1-6]$/);
      if (previousHeading) {
        const previousLevel = parseInt(previousHeading[0].charAt(1));
        if (level > previousLevel + 1) {
          issues.push(
            `Heading level ${level} skips level ${previousLevel + 1}`
          );
        }
      }
    }

    return issues;
  },

  /**
   * Validates color contrast (simplified check)
   */
  validateColorContrast: (element: HTMLElement): boolean => {
    const styles = window.getComputedStyle(element);
    const backgroundColor = styles.backgroundColor;
    const color = styles.color;

    // This is a simplified check - in a real implementation,
    // you would calculate the actual contrast ratio
    return backgroundColor !== color;
  },

  /**
   * Checks if element is keyboard accessible
   */
  isKeyboardAccessible: (element: HTMLElement): boolean => {
    const tabIndex = element.getAttribute('tabindex');
    const isInteractive = [
      'BUTTON',
      'A',
      'INPUT',
      'SELECT',
      'TEXTAREA',
    ].includes(element.tagName);

    return isInteractive || (tabIndex !== null && tabIndex !== '-1');
  },
};

/**
 * Responsive design utilities
 */
export const ResponsiveHelpers = {
  /**
   * Gets current breakpoint based on window width
   */
  getCurrentBreakpoint: (): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' => {
    const width = window.innerWidth;

    if (width >= 1536) return '2xl';
    if (width >= 1280) return 'xl';
    if (width >= 1024) return 'lg';
    if (width >= 768) return 'md';
    if (width >= 640) return 'sm';
    return 'xs';
  },

  /**
   * Checks if current viewport is mobile
   */
  isMobile: (): boolean => {
    return window.innerWidth < 768;
  },

  /**
   * Checks if current viewport is tablet
   */
  isTablet: (): boolean => {
    const width = window.innerWidth;
    return width >= 768 && width < 1024;
  },

  /**
   * Checks if current viewport is desktop
   */
  isDesktop: (): boolean => {
    return window.innerWidth >= 1024;
  },

  /**
   * Handles responsive image loading
   */
  getResponsiveImageSrc: (baseSrc: string, breakpoint?: string): string => {
    const currentBreakpoint =
      breakpoint || ResponsiveHelpers.getCurrentBreakpoint();

    // Return appropriate image size based on breakpoint
    switch (currentBreakpoint) {
      case 'xs':
      case 'sm':
        return baseSrc.replace(/\.(jpg|jpeg|png|webp)$/i, '_mobile.$1');
      case 'md':
        return baseSrc.replace(/\.(jpg|jpeg|png|webp)$/i, '_tablet.$1');
      default:
        return baseSrc;
    }
  },
};

/**
 * Animation utilities that respect user preferences
 */
export const AccessibleAnimations = {
  /**
   * Checks if user prefers reduced motion
   */
  prefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Gets animation duration based on user preference
   */
  getAnimationDuration: (normalDuration: number): number => {
    return AccessibleAnimations.prefersReducedMotion() ? 0 : normalDuration;
  },

  /**
   * Creates accessible animation config for Framer Motion
   */
  createAccessibleAnimation: (animation: any) => {
    if (AccessibleAnimations.prefersReducedMotion()) {
      return {
        ...animation,
        transition: { duration: 0 },
      };
    }
    return animation;
  },
};

/**
 * Enhanced keyboard navigation for complex components
 */
export class EnhancedKeyboardNavigation {
  private elements: HTMLElement[] = [];
  private currentIndex = -1;
  private container: HTMLElement;

  constructor(
    container: HTMLElement,
    selector: string = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) {
    this.container = container;
    this.updateElements(selector);
  }

  updateElements(selector: string) {
    this.elements = Array.from(
      this.container.querySelectorAll(selector)
    ).filter(
      el =>
        !el.hasAttribute('disabled') &&
        (el as HTMLElement).offsetParent !== null
    ) as HTMLElement[];
  }

  handleKeyDown = (event: KeyboardEvent) => {
    const { key } = event;

    switch (key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        this.focusNext();
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        this.focusPrevious();
        break;
      case 'Home':
        event.preventDefault();
        this.focusFirst();
        break;
      case 'End':
        event.preventDefault();
        this.focusLast();
        break;
      case 'Enter':
      case ' ':
        if (
          event.target &&
          (event.target as HTMLElement).tagName === 'BUTTON'
        ) {
          event.preventDefault();
          (event.target as HTMLButtonElement).click();
        }
        break;
    }
  };

  focusNext() {
    this.currentIndex = (this.currentIndex + 1) % this.elements.length;
    this.elements[this.currentIndex]?.focus();
  }

  focusPrevious() {
    this.currentIndex =
      this.currentIndex <= 0 ? this.elements.length - 1 : this.currentIndex - 1;
    this.elements[this.currentIndex]?.focus();
  }

  focusFirst() {
    this.currentIndex = 0;
    this.elements[this.currentIndex]?.focus();
  }

  focusLast() {
    this.currentIndex = this.elements.length - 1;
    this.elements[this.currentIndex]?.focus();
  }

  activate() {
    this.container.addEventListener('keydown', this.handleKeyDown);
  }

  deactivate() {
    this.container.removeEventListener('keydown', this.handleKeyDown);
  }
}

/**
 * Live region manager for dynamic content announcements
 */
export class LiveRegionManager {
  private static instance: LiveRegionManager;
  private politeRegion: HTMLElement | null = null;
  private assertiveRegion: HTMLElement | null = null;

  static getInstance(): LiveRegionManager {
    if (!LiveRegionManager.instance) {
      LiveRegionManager.instance = new LiveRegionManager();
    }
    return LiveRegionManager.instance;
  }

  private constructor() {
    this.createLiveRegions();
  }

  private createLiveRegions() {
    // Polite live region
    this.politeRegion = document.createElement('div');
    this.politeRegion.setAttribute('aria-live', 'polite');
    this.politeRegion.setAttribute('aria-atomic', 'true');
    this.politeRegion.className = 'sr-only';
    this.politeRegion.id = 'live-region-polite';
    document.body.appendChild(this.politeRegion);

    // Assertive live region
    this.assertiveRegion = document.createElement('div');
    this.assertiveRegion.setAttribute('aria-live', 'assertive');
    this.assertiveRegion.setAttribute('aria-atomic', 'true');
    this.assertiveRegion.className = 'sr-only';
    this.assertiveRegion.id = 'live-region-assertive';
    document.body.appendChild(this.assertiveRegion);
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    const region =
      priority === 'assertive' ? this.assertiveRegion : this.politeRegion;

    if (region) {
      // Clear previous message
      region.textContent = '';

      // Add new message after a brief delay to ensure it's announced
      setTimeout(() => {
        if (region) {
          region.textContent = message;
        }
      }, 100);

      // Clear the message after announcement
      setTimeout(() => {
        if (region) {
          region.textContent = '';
        }
      }, 1000);
    }
  }

  announceNavigation(sectionName: string) {
    this.announce(`${sectionName}セクションに移動しました`, 'polite');
  }

  announceLoading(message: string = '読み込み中') {
    this.announce(message, 'polite');
  }

  announceError(message: string) {
    this.announce(`エラー: ${message}`, 'assertive');
  }

  announceSuccess(message: string) {
    this.announce(message, 'polite');
  }
}
