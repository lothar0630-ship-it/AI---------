import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ErrorBoundary from './components/ErrorBoundary';
import {
  LazyAboutSectionWrapper,
  LazyYouTubeSectionWrapper,
  LazySocialSectionWrapper,
  LazyFooterWrapper,
} from './components/LazyComponents';
import { useConfig } from './hooks';
import { globalErrorHandler } from './utils/errorHandler';
import { LiveRegionManager } from './utils/accessibilityHelpers';

function App() {
  const { config, loading, error } = useConfig();
  const liveRegionManager = LiveRegionManager.getInstance();

  // Log configuration errors to global error handler
  if (error) {
    globalErrorHandler.logError(
      new Error(`Configuration loading failed: ${error}`),
      {
        component: 'App',
        context: 'useConfig',
      }
    );
    liveRegionManager.announceError('設定の読み込みに失敗しました');
  }

  if (loading) {
    return (
      <motion.div
        className="min-h-screen bg-white flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="text-center">
          <motion.div
            className="rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <motion.p
            className="text-secondary-600"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            読み込み中...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="min-h-screen bg-white flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <motion.svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ delay: 0.4 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </motion.svg>
          </motion.div>
          <motion.h2
            className="text-2xl font-bold text-secondary-800 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            設定の読み込みに失敗しました
          </motion.h2>
          <motion.p
            className="text-secondary-600 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            サイトの設定ファイルを読み込めませんでした。
          </motion.p>
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              onClick={() => window.location.reload()}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              再読み込み
            </motion.button>
          </motion.div>
          <motion.p
            className="text-sm text-secondary-500 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            問題が続く場合は、しばらく時間をおいてから再度アクセスしてください。
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        <motion.div
          className="min-h-screen bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Skip to main content link for accessibility */}
          <a
            href="#main-content"
            className="skip-link"
            onFocus={e => (e.currentTarget.style.top = '6px')}
            onBlur={e => (e.currentTarget.style.top = '-40px')}
          >
            メインコンテンツにスキップ
          </a>

          <Header personalInfo={config.personalInfo} />

          <main id="main-content" role="main">
            {/* Hero Section */}
            <ErrorBoundary
              fallback={
                <motion.div
                  className="py-20 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-secondary-600">
                    ヒーローセクションの読み込みに失敗しました
                  </p>
                </motion.div>
              }
            >
              <HeroSection personalInfo={config.personalInfo} />
            </ErrorBoundary>

            {/* About Section */}
            <ErrorBoundary
              fallback={
                <motion.div
                  className="py-20 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-secondary-600">
                    自己紹介セクションの読み込みに失敗しました
                  </p>
                </motion.div>
              }
            >
              <LazyAboutSectionWrapper personalInfo={config.personalInfo} />
            </ErrorBoundary>

            {/* YouTube Section */}
            <ErrorBoundary
              fallback={
                <motion.div
                  className="py-20 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-secondary-600">
                    YouTubeセクションの読み込みに失敗しました
                  </p>
                </motion.div>
              }
            >
              <LazyYouTubeSectionWrapper channels={config.youtubeChannels} />
            </ErrorBoundary>

            {/* Social Section */}
            <ErrorBoundary
              fallback={
                <motion.div
                  className="py-20 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-secondary-600">
                    ソーシャルセクションの読み込みに失敗しました
                  </p>
                </motion.div>
              }
            >
              <LazySocialSectionWrapper socialLinks={config.socialLinks} />
            </ErrorBoundary>
          </main>

          {/* Footer */}
          <ErrorBoundary
            fallback={
              <motion.footer
                className="bg-secondary-800 text-white py-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="container mx-auto px-4 text-center">
                  <p>&copy; 2024 Personal Portfolio. All rights reserved.</p>
                </div>
              </motion.footer>
            }
          >
            <LazyFooterWrapper personalInfo={config.personalInfo} />
          </ErrorBoundary>
        </motion.div>
      </AnimatePresence>
    </ErrorBoundary>
  );
}

export default App;
