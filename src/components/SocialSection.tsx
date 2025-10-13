import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { SocialLink as SocialLinkType } from '../types';
import SocialLink from './SocialLink';

interface SocialSectionProps {
  socialLinks: SocialLinkType[];
}

/**
 * ソーシャルメディアセクションコンポーネント
 * 各種ソーシャルメディアへのリンクを表示
 */
const SocialSection: React.FC<SocialSectionProps> = ({ socialLinks }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <motion.section
      id="social"
      ref={sectionRef}
      className="py-20 bg-white relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: isInView ? 1 : 0 }}
      transition={{ duration: 0.6 }}
      aria-labelledby="social-heading"
    >
      {/* 背景装飾要素 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-accent/5 rounded-full blur-2xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 10, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl"
          animate={{
            x: [0, 15, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="container-responsive relative z-10">
        {/* セクションタイトル */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.h2
            id="social-heading"
            className="text-responsive-4xl md:text-responsive-5xl font-black text-primary mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isInView ? 1 : 0, scale: isInView ? 1 : 0.9 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            つながりましょう
          </motion.h2>
          <motion.div
            className="h-1.5 w-24 bg-primary mx-auto rounded-full mb-6"
            initial={{ width: 0 }}
            animate={{ width: isInView ? 96 : 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
          <motion.p
            className="text-lg text-secondary-700 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            各種ソーシャルメディアでも情報を発信しています。お気軽にフォローしてください。
          </motion.p>
        </motion.div>

        {/* ソーシャルリンクがない場合の表示 */}
        {socialLinks.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <p className="text-secondary-600 text-lg">
              ソーシャルメディアリンクが設定されていません。
            </p>
          </motion.div>
        )}

        {/* ソーシャルリンクのグリッド表示 */}
        {socialLinks.length > 0 && (
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: isInView ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {socialLinks.map((socialLink, index) => (
                <motion.div
                  key={`${socialLink.platform}-${socialLink.url}`}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{
                    opacity: isInView ? 1 : 0,
                    y: isInView ? 0 : 50,
                    scale: isInView ? 1 : 0.9,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 0.9 + index * 0.1,
                    type: 'spring',
                    stiffness: 100,
                  }}
                >
                  <SocialLink socialLink={socialLink} />
                </motion.div>
              ))}
            </div>

            {/* 追加のソーシャルリンクを促すメッセージ（拡張性のため） */}
            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 30 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <motion.div
                className="bg-gray-50 rounded-2xl p-8 border border-gray-100"
                whileHover={{
                  y: -5,
                  boxShadow:
                    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <motion.h3
                  className="text-xl font-bold text-secondary-800 mb-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isInView ? 1 : 0 }}
                  transition={{ delay: 1.4 }}
                >
                  他のプラットフォームでも
                </motion.h3>
                <motion.p
                  className="text-secondary-600 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isInView ? 1 : 0 }}
                  transition={{ delay: 1.5 }}
                >
                  今後、他のソーシャルメディアプラットフォームでも活動を予定しています。
                  最新情報をお見逃しなく！
                </motion.p>
                <div className="flex justify-center space-x-2">
                  {[0, 1, 2].map(index => (
                    <motion.div
                      key={index}
                      className="w-2 h-2 bg-primary rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: index * 0.2,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};

export default SocialSection;
