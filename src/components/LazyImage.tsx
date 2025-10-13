import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  [key: string]: any;
}

/**
 * 遅延読み込み対応の画像コンポーネント
 * Intersection Observer APIを使用して画像の遅延読み込みを実装
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder,
  loading = 'lazy',
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // eager loading の場合は即座に読み込み開始
    if (loading === 'eager') {
      setIsInView(true);
      return;
    }

    // Intersection Observer の設定
    const options = {
      root: null,
      rootMargin: '50px', // 50px手前で読み込み開始
      threshold: 0.1,
    };

    observerRef.current = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsInView(true);
          // 一度読み込みが開始されたら監視を停止
          if (observerRef.current && imgRef.current) {
            observerRef.current.unobserve(imgRef.current);
          }
        }
      });
    }, options);

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    setIsLoaded(true);
    onError?.(e);
  };

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* プレースホルダー */}
      {!isLoaded && !hasError && (
        <motion.div
          className="absolute inset-0 bg-gray-200 flex items-center justify-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {placeholder ? (
            <img
              src={placeholder}
              alt=""
              className="w-full h-full object-cover opacity-50"
              aria-hidden="true"
            />
          ) : (
            <div
              className="w-16 h-16 bg-gray-300 rounded-lg"
              aria-hidden="true"
            />
          )}
        </motion.div>
      )}

      {/* エラー表示 */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="w-12 h-12 bg-gray-300 rounded-lg mx-auto mb-2" />
            <p className="text-sm">画像を読み込めませんでした</p>
          </div>
        </div>
      )}

      {/* 実際の画像 */}
      {isInView && (
        <motion.img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          onLoad={handleLoad}
          onError={handleError}
          loading={loading}
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;
