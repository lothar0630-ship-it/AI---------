import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

// 遅延読み込み用のコンポーネント
const LazyYouTubeSection = React.lazy(() => import('./YouTubeSection'));
const LazySocialSection = React.lazy(() => import('./SocialSection'));
const LazyAboutSection = React.lazy(() => import('./AboutSection'));
const LazyFooter = React.lazy(() => import('./Footer'));

/**
 * 遅延読み込み用のラッパーコンポーネント
 */
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const LazyWrapper: React.FC<LazyWrapperProps> = ({ children, fallback }) => {
  const defaultFallback = (
    <motion.div
      className="py-20 flex justify-center items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <LoadingSpinner />
    </motion.div>
  );

  return <Suspense fallback={fallback || defaultFallback}>{children}</Suspense>;
};

/**
 * 遅延読み込み対応のYouTubeセクション
 */
export const LazyYouTubeSectionWrapper: React.FC<any> = props => (
  <LazyWrapper>
    <LazyYouTubeSection {...props} />
  </LazyWrapper>
);

/**
 * 遅延読み込み対応のソーシャルセクション
 */
export const LazySocialSectionWrapper: React.FC<any> = props => (
  <LazyWrapper>
    <LazySocialSection {...props} />
  </LazyWrapper>
);

/**
 * 遅延読み込み対応の自己紹介セクション
 */
export const LazyAboutSectionWrapper: React.FC<any> = props => (
  <LazyWrapper>
    <LazyAboutSection {...props} />
  </LazyWrapper>
);

/**
 * 遅延読み込み対応のフッター
 */
export const LazyFooterWrapper: React.FC<any> = props => (
  <LazyWrapper>
    <LazyFooter {...props} />
  </LazyWrapper>
);

export default LazyWrapper;
