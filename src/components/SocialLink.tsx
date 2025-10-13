import React from 'react';
import { motion } from 'framer-motion';
import { SocialLink as SocialLinkType } from '../types';
import { ExternalLink } from 'lucide-react';

interface SocialLinkProps {
  socialLink: SocialLinkType;
  className?: string;
}

/**
 * ソーシャルリンクコンポーネント
 * 各ソーシャルメディアプラットフォームへのリンクを表示
 */
const SocialLink: React.FC<SocialLinkProps> = ({
  socialLink,
  className = '',
}) => {
  // プラットフォームに応じたアイコンを取得
  const getIcon = (platform: string): React.ReactNode => {
    const platformLower = platform.toLowerCase();

    // SVGアイコンを直接定義（Lucideの非推奨アイコンの代替）
    switch (platformLower) {
      case 'twitter':
        return (
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        );
      case 'github':
        return (
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        );
      case 'linkedin':
        return (
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        );
      case 'instagram':
        return (
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        );
      case 'facebook':
        return (
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        );
      case 'youtube':
        return (
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        );
      case 'niconico':
        return (
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 17.568c0 .432-.352.784-.784.784H7.216c-.432 0-.784-.352-.784-.784V6.432c0-.432.352-.784.784-.784h9.568c.432 0 .784.352.784.784v11.136zM8.784 8.784v6.432h1.568V8.784H8.784zm2.352 0v6.432h1.568V8.784h-1.568zm2.352 0v6.432h1.568V8.784h-1.568z" />
          </svg>
        );
      default:
        return <ExternalLink size={32} strokeWidth={1.5} />;
    }
  };

  const iconElement = getIcon(socialLink.platform);

  // プラットフォームに応じた色を取得
  const getPlatformColors = (platform: string) => {
    const colorMap: Record<
      string,
      { bg: string; hover: string; text: string }
    > = {
      twitter: {
        bg: 'bg-blue-50 hover:bg-blue-500',
        hover: 'group-hover:text-white',
        text: 'text-blue-600',
      },
      github: {
        bg: 'bg-gray-50 hover:bg-gray-800',
        hover: 'group-hover:text-white',
        text: 'text-gray-700',
      },
      linkedin: {
        bg: 'bg-blue-50 hover:bg-blue-700',
        hover: 'group-hover:text-white',
        text: 'text-blue-700',
      },
      instagram: {
        bg: 'bg-pink-50 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500',
        hover: 'group-hover:text-white',
        text: 'text-pink-600',
      },
      facebook: {
        bg: 'bg-blue-50 hover:bg-blue-600',
        hover: 'group-hover:text-white',
        text: 'text-blue-600',
      },
      youtube: {
        bg: 'bg-red-50 hover:bg-red-600',
        hover: 'group-hover:text-white',
        text: 'text-red-600',
      },
      niconico: {
        bg: 'bg-orange-50 hover:bg-orange-500',
        hover: 'group-hover:text-white',
        text: 'text-orange-600',
      },
    };

    return (
      colorMap[platform.toLowerCase()] || {
        bg: 'bg-gray-50 hover:bg-primary',
        hover: 'group-hover:text-white',
        text: 'text-primary',
      }
    );
  };

  const colors = getPlatformColors(socialLink.platform);

  return (
    <motion.a
      href={socialLink.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block ${className}`}
      aria-label={`${socialLink.label}を新しいタブで開く`}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <motion.div
        className={`${colors.bg} rounded-2xl p-6 border border-gray-100 cursor-pointer`}
        whileHover={{
          borderColor: 'transparent',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* アイコン */}
            <motion.div
              className={`${colors.text} ${colors.hover} transition-colors duration-300`}
              whileHover={{
                scale: 1.1,
                rotate: 5,
              }}
              transition={{ type: 'spring', stiffness: 300 }}
              aria-hidden="true"
            >
              {iconElement}
            </motion.div>

            {/* プラットフォーム情報 */}
            <div>
              <motion.h3
                className={`font-bold text-responsive-lg ${colors.text} ${colors.hover} transition-colors duration-300`}
                transition={{ duration: 0.3 }}
              >
                {socialLink.label}
              </motion.h3>
              <motion.p
                className={`text-responsive-sm opacity-75 ${colors.text} ${colors.hover} group-hover:opacity-100 transition-all duration-300`}
                transition={{ duration: 0.3 }}
              >
                フォローする
              </motion.p>
            </div>
          </div>

          {/* 外部リンクアイコン */}
          <motion.div
            className={`${colors.text} ${colors.hover} opacity-50 group-hover:opacity-100 transition-all duration-300`}
            whileHover={{
              x: 3,
            }}
            transition={{ duration: 0.3 }}
          >
            <ExternalLink size={20} strokeWidth={1.5} />
          </motion.div>
        </div>
      </motion.div>
    </motion.a>
  );
};

export default SocialLink;
