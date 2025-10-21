import React from 'react';
import LazyImage from './LazyImage';

interface OptimizedImageProps {
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
 * 最適化された画像コンポーネント
 * WebP形式をサポートし、フォールバックでPNG/JPEGを使用
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  placeholder,
  loading = 'lazy',
  onLoad,
  onError,
  ...props
}) => {
  // ファイル拡張子を取得
  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase();
  };

  // WebP版のパスを生成
  const getWebPPath = (originalPath: string) => {
    const extension = getFileExtension(originalPath);
    if (!extension) return originalPath;

    return originalPath.replace(new RegExp(`\\.${extension}$`), '.webp');
  };

  const webpSrc = getWebPPath(src);
  const extension = getFileExtension(src);

  // WebPをサポートしていない場合のフォールバック
  return (
    <picture>
      {/* WebP形式（対応ブラウザのみ） */}
      {extension !== 'svg' && <source srcSet={webpSrc} type="image/webp" />}

      {/* オリジナル形式（フォールバック） */}
      <LazyImage
        src={src}
        alt={alt}
        className={className}
        placeholder={placeholder}
        loading={loading}
        onLoad={onLoad}
        onError={onError}
        {...props}
      />
    </picture>
  );
};

export default OptimizedImage;
