import React from 'react';
import { motion } from 'framer-motion';
import { PersonalInfo } from '../types';
import OptimizedImage from './OptimizedImage';

interface HeroSectionProps {
  personalInfo: PersonalInfo;
}

const HeroSection: React.FC<HeroSectionProps> = ({ personalInfo }) => {
  // 画像読み込み完了ハンドラー
  const handleImageLoad = () => {
    // LazyImage コンポーネントが読み込み状態を管理
  };

  // 画像読み込みエラーハンドラー
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.warn('Avatar image failed to load, using fallback');
    e.currentTarget.src = '/images/default-avatar.svg';
  };

  return (
    <motion.section
      id="hero"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-white relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      role="banner"
      aria-labelledby="hero-heading"
    >
      {/* 背景装飾要素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="container-responsive relative z-10">
        <motion.div
          className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* アバター画像セクション */}
          <motion.div
            className="flex-shrink-0 relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {/* アバター画像 */}
              <motion.div
                className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden shadow-2xl ring-4 ring-white/50 relative"
                initial={{ rotate: -5 }}
                animate={{ rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <OptimizedImage
                  src={personalInfo.avatar}
                  alt={`${personalInfo.name}のプロフィール写真`}
                  className="w-full h-full object-cover"
                  loading="eager"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  placeholder="/images/avatar-placeholder.svg"
                  aria-describedby="hero-heading"
                />
              </motion.div>

              {/* オンライン状態インジケーター */}
              <motion.div
                className="absolute bottom-4 right-4 md:bottom-6 md:right-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: 'spring', stiffness: 200 }}
                role="status"
                aria-label="オンライン状態: 現在アクティブ"
                aria-live="polite"
              >
                <div className="relative">
                  <motion.div
                    className="w-6 h-6 md:w-8 md:h-8 bg-green-500 rounded-full border-4 border-white shadow-lg"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    aria-hidden="true"
                  />
                  <motion.div
                    className="absolute inset-0 w-6 h-6 md:w-8 md:h-8 bg-green-500 rounded-full opacity-75"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.75, 0, 0.75] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    aria-hidden="true"
                  />
                </div>
                <span className="sr-only">現在オンライン</span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* テキストセクション */}
          <div className="flex-1 text-center md:text-left max-w-2xl">
            {/* 挨拶アニメーション */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.p
                className="text-lg md:text-xl text-secondary-600 mb-2"
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                👋 こんにちは！
              </motion.p>
            </motion.div>

            {/* 名前 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.h1
                id="hero-heading"
                className="text-responsive-4xl md:text-responsive-6xl font-black text-primary mb-4 leading-tight"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {personalInfo.name}
              </motion.h1>
            </motion.div>

            {/* 職業・肩書き */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <p className="text-responsive-2xl md:text-responsive-3xl font-bold text-secondary-700 mb-6">
                {personalInfo.title}
              </p>
            </motion.div>

            {/* 自己紹介文 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <p className="text-responsive-lg md:text-responsive-xl text-secondary-600 leading-relaxed mb-8">
                {personalInfo.description}
              </p>
            </motion.div>

            {/* CTAボタン */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              role="group"
              aria-label="アクションボタン"
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <motion.button
                  onClick={() => {
                    const aboutSection = document.getElementById('about');
                    aboutSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-primary text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-primary/30 focus:ring-offset-2"
                  aria-label="自己紹介セクションを見る"
                  aria-describedby="hero-heading"
                  whileHover={{
                    scale: 1.05,
                    boxShadow:
                      '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  もっと詳しく
                </motion.button>
                <motion.button
                  onClick={() => {
                    const socialSection = document.getElementById('social');
                    socialSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="border-2 border-primary text-primary px-8 py-4 rounded-full font-semibold text-lg shadow-lg focus:outline-none focus:ring-4 focus:ring-primary/30 focus:ring-offset-2"
                  aria-label="お問い合わせセクションに移動"
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: '#059669',
                    color: '#FFFFFF',
                    boxShadow:
                      '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  お問い合わせ
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default HeroSection;
