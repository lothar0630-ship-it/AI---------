import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import VideoCard from './VideoCard';

interface ChannelData {
  id: string;
  name: string;
  description: string;
  url: string;
  customUrl?: string;
  videos?: Array<{
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    publishedAt: string;
    url: string;
  }>;
  hasApiData?: boolean;
}

interface ChannelCardProps {
  channel: ChannelData;
  isLoading: boolean;
  hasApiConnection: boolean;
}

/**
 * YouTube チャンネルカードコンポーネント
 * チャンネル情報と最新動画を表示
 */
export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  isLoading,
  hasApiConnection,
}) => {
  const latestVideo =
    channel.videos && channel.videos.length > 0 ? channel.videos[0] : null;

  return (
    <motion.article
      className="bg-white rounded-3xl shadow-xl overflow-hidden h-full flex flex-col"
      whileHover={{
        y: -8,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        scale: 1.02,
      }}
      transition={{ type: 'spring', stiffness: 300 }}
      role="article"
      aria-labelledby={`channel-${channel.id}-title`}
    >
      {/* チャンネルヘッダー */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <motion.div
              className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
              aria-hidden="true"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-white"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </motion.div>
            <div>
              <motion.h3
                id={`channel-${channel.id}-title`}
                className="text-responsive-xl font-bold text-secondary-800"
                whileHover={{ color: 'var(--color-primary)' }}
              >
                {channel.name}
              </motion.h3>
            </div>
          </div>
        </div>

        <motion.p
          className="text-secondary-600 text-sm leading-relaxed mb-4 h-12 overflow-hidden"
          initial={{ opacity: 0.8 }}
          whileHover={{ opacity: 1 }}
        >
          {channel.description}
        </motion.p>

        <motion.a
          href={channel.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 text-primary font-medium text-responsive-sm group"
          whileHover={{
            color: 'var(--color-primary-600)',
            x: 5,
          }}
          transition={{ type: 'spring', stiffness: 300 }}
          aria-label={`${channel.name}のYouTubeチャンネルを新しいタブで開く`}
        >
          <span>チャンネルを見る</span>
          <motion.div
            animate={{ x: [0, 2, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ExternalLink className="w-4 h-4" />
          </motion.div>
        </motion.a>
      </div>

      {/* 最新動画セクション */}
      <div className="p-6 flex-1 flex flex-col">
        <h4 className="text-responsive-lg font-semibold text-secondary-800 mb-4">
          最新動画
        </h4>

        {/* ローディング状態 */}
        {isLoading && hasApiConnection && (
          <motion.div
            className="flex items-center justify-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="rounded-full h-8 w-8 border-4 border-primary/20 border-t-primary"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        )}

        {/* 動画が取得できた場合 */}
        {latestVideo && !isLoading && <VideoCard video={latestVideo} />}

        {/* 動画が取得できない場合 */}
        {!latestVideo && !isLoading && (
          <motion.div
            className="text-center py-8 flex-1 flex flex-col justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
              aria-hidden="true"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-8 h-8 text-gray-400"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </motion.div>
            <p className="text-secondary-500 text-responsive-sm mb-4">
              最新動画を確認するには、チャンネルページをご覧ください
            </p>
            <motion.a
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg text-responsive-sm font-medium mx-auto"
              aria-label={`${channel.name}をYouTubeで見る`}
              whileHover={{
                scale: 1.05,
                backgroundColor: 'var(--color-primary-600)',
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              <span>YouTube で見る</span>
            </motion.a>
          </motion.div>
        )}
      </div>
    </motion.article>
  );
};

export default ChannelCard;
