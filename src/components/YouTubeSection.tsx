import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { YouTubeChannel } from '../types';
import { useYouTubeData, useYouTubeAvailability } from '../hooks';
import ChannelCard from './ChannelCard';

interface YouTubeSectionProps {
  channels: YouTubeChannel[];
}

/**
 * YouTube セクションコンポーネント
 * 2つのYouTubeチャンネルの情報と最新動画を表示
 */
export const YouTubeSection: React.FC<YouTubeSectionProps> = ({ channels }) => {
  const { isAvailable, hasApiKey } = useYouTubeAvailability();
  const { data: youtubeData, isLoading, error } = useYouTubeData(channels);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <motion.section
      id="youtube"
      ref={sectionRef}
      className="py-20 bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: isInView ? 1 : 0 }}
      transition={{ duration: 0.6 }}
      aria-labelledby="youtube-heading"
    >
      <div className="container-responsive">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.h2
            id="youtube-heading"
            className="text-responsive-4xl font-bold text-primary mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isInView ? 1 : 0, scale: isInView ? 1 : 0.9 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            YouTube チャンネル
          </motion.h2>
          <motion.div
            className="h-1.5 w-24 bg-primary mx-auto mb-6"
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
            2つのチャンネルで異なるコンテンツを配信しています。最新の動画をチェックしてみてください。
          </motion.p>
        </motion.div>

        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 30 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* 最新動画が利用できない場合の表示 */}
          {(!hasApiKey || !isAvailable) && (
            <motion.div
              className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{
                opacity: isInView ? 1 : 0,
                scale: isInView ? 1 : 0.95,
              }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                チャンネル情報を表示中
              </h3>
              <p className="text-blue-700">
                最新動画については各チャンネルページをご確認ください。
              </p>
            </motion.div>
          )}

          {/* ローディング状態 */}
          {isLoading && isAvailable && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <motion.p
                className="text-secondary-600"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                最新動画を読み込み中...
              </motion.p>
            </motion.div>
          )}

          {/* エラー状態 */}
          {(error?.videos || error?.channels) && (
            <motion.div
              className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: isInView ? 1 : 0, x: isInView ? 0 : -20 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                チャンネル情報を表示中
              </h3>
              <p className="text-blue-700">
                最新動画については各チャンネルページをご確認ください。
              </p>
            </motion.div>
          )}

          {/* チャンネル情報がない場合 */}
          {channels.length === 0 && (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <p className="text-secondary-600 text-lg">
                YouTube チャンネルが設定されていません。
              </p>
            </motion.div>
          )}

          {/* チャンネルカードのグリッド表示 */}
          {channels.length > 0 && (
            <motion.div
              className="grid gap-8 md:grid-cols-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: isInView ? 1 : 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {youtubeData?.map((channelData, index) => (
                <motion.div
                  key={channelData.id}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{
                    opacity: isInView ? 1 : 0,
                    y: isInView ? 0 : 50,
                    scale: isInView ? 1 : 0.9,
                  }}
                  transition={{
                    duration: 0.6,
                    delay: 0.8 + index * 0.2,
                    type: 'spring',
                    stiffness: 100,
                  }}
                >
                  <ChannelCard
                    channel={channelData}
                    isLoading={isLoading}
                    hasApiConnection={isAvailable && hasApiKey}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default YouTubeSection;
