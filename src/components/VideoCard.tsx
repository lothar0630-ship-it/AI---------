import React from 'react';
import { motion } from 'framer-motion';
import { Play, ExternalLink } from 'lucide-react';
import LazyImage from './LazyImage';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  url: string;
}

interface VideoCardProps {
  video: Video;
}

/**
 * YouTube 動画カードコンポーネント
 * 動画のサムネイル、タイトル、投稿日を表示
 */
export const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  // 投稿日をフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // タイトルを適切な長さに切り詰め
  const truncateTitle = (title: string, maxLength: number = 60) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  // 画像読み込み完了ハンドラー
  const handleImageLoad = () => {
    // LazyImage コンポーネントが読み込み状態を管理
  };

  // 画像読み込みエラーハンドラー
  const handleImageError = () => {
    // LazyImage コンポーネントがエラー状態を管理
  };

  return (
    <motion.a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300 }}
      aria-label={`動画「${video.title}」をYouTubeで視聴する`}
    >
      <motion.div
        className="bg-white rounded-lg overflow-hidden"
        whileHover={{
          boxShadow:
            '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
        transition={{ duration: 0.2 }}
      >
        {/* サムネイル部分 */}
        <div className="relative aspect-video bg-gray-100 overflow-hidden">
          <LazyImage
            src={video.thumbnail}
            alt={`動画「${video.title}」のサムネイル`}
            className="w-full h-full object-cover"
            loading="lazy"
            onLoad={handleImageLoad}
            onError={handleImageError}
            placeholder="/images/video-placeholder.svg"
          />

          {/* プレイボタンオーバーレイ */}
          <motion.div
            className="absolute inset-0 bg-black flex items-center justify-center"
            initial={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
            whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
            transition={{ duration: 0.3 }}
            aria-hidden="true"
          >
            <motion.div
              className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
              initial={{ opacity: 0, scale: 0.75 }}
              whileHover={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              whileTap={{ scale: 0.9 }}
              aria-hidden="true"
            >
              <Play
                className="w-6 h-6 text-white ml-1"
                fill="currentColor"
                aria-hidden="true"
              />
            </motion.div>
          </motion.div>

          {/* 外部リンクアイコン */}
          <motion.div
            className="absolute top-3 right-3"
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            aria-hidden="true"
          >
            <motion.div
              className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-md"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ExternalLink
                className="w-4 h-4 text-gray-700"
                aria-hidden="true"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* 動画情報部分 */}
        <div className="p-4">
          <motion.h5
            className="font-semibold text-secondary-800 text-responsive-sm leading-snug mb-2"
            whileHover={{ color: 'var(--color-primary)' }}
            transition={{ duration: 0.2 }}
          >
            {truncateTitle(video.title)}
          </motion.h5>

          <div className="flex items-center justify-between text-responsive-xs text-secondary-500">
            <time
              dateTime={video.publishedAt}
              aria-label={`投稿日: ${formatDate(video.publishedAt)}`}
            >
              {formatDate(video.publishedAt)}
            </time>
            <motion.div
              className="flex items-center space-x-1"
              initial={{ opacity: 0, x: 10 }}
              whileHover={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              aria-hidden="true"
            >
              <Play className="w-3 h-3" aria-hidden="true" />
              <span>再生</span>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.a>
  );
};

export default VideoCard;
