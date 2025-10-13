import React, { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { LiveRegionManager } from '../utils/accessibilityHelpers';

interface HeaderProps {
  personalInfo?: {
    name: string;
  };
}

const Header: React.FC<HeaderProps> = ({ personalInfo }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const liveRegionManager = LiveRegionManager.getInstance();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !menuButtonRef.current?.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Trap focus within mobile menu
  useEffect(() => {
    if (isMenuOpen && menuRef.current) {
      const focusableElements = menuRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      const handleTabKey = (event: KeyboardEvent) => {
        if (event.key === 'Tab') {
          if (event.shiftKey) {
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement?.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement?.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      firstElement?.focus();

      return () => document.removeEventListener('keydown', handleTabKey);
    }
  }, [isMenuOpen]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      // Announce navigation to screen readers
      const sectionNames: Record<string, string> = {
        hero: 'ヒーロー',
        about: '自己紹介',
        youtube: 'YouTube',
        social: 'ソーシャルメディア',
      };
      liveRegionManager.announceNavigation(
        sectionNames[sectionId] || sectionId
      );
    }
    setIsMenuOpen(false);
  };

  const navigationItems = [
    { id: 'about', label: 'About' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'social', label: 'Social' },
  ];

  return (
    <header
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm"
      role="banner"
      aria-label="サイトナビゲーション"
    >
      <div className="container-responsive">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={() => scrollToSection('hero')}
              className="text-2xl font-bold text-primary hover:text-primary-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md px-2 py-1"
              aria-label="ホームに戻る"
            >
              {personalInfo?.name || 'Portfolio'}.dev
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:block ml-auto"
            aria-label="メインナビゲーション"
          >
            <div className="flex items-baseline space-x-8" role="menubar">
              {navigationItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-secondary-600 hover:text-primary font-medium px-3 py-2 rounded-md text-sm transition-colors duration-200 focus:outline-none"
                  aria-label={`${item.label}セクションに移動`}
                  role="menuitem"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              ref={menuButtonRef}
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-secondary-600 hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary transition-colors duration-200"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            id="mobile-menu"
            className="md:hidden"
            role="menu"
            aria-labelledby="mobile-menu-button"
            aria-hidden={!isMenuOpen}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {navigationItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-secondary-600 hover:text-primary block px-3 py-2 rounded-md text-base font-medium w-full text-left transition-colors duration-200 focus:outline-none"
                  role="menuitem"
                  aria-label={`${item.label}セクションに移動`}
                  tabIndex={isMenuOpen ? 0 : -1}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
