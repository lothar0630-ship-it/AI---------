import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
  className?: string;
}

/**
 * アニメーション付きローディングスピナーコンポーネント
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  text,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const colorClasses = {
    primary: 'border-primary/20 border-t-primary',
    secondary: 'border-secondary/20 border-t-secondary',
    white: 'border-white/20 border-t-white',
  };

  const textColorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary-600',
    white: 'text-white',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        className={`
          rounded-full border-4 
          ${sizeClasses[size]} 
          ${colorClasses[color]}
        `}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {text && (
        <motion.p
          className={`mt-4 text-sm font-medium ${textColorClasses[color]}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

/**
 * ドットアニメーション付きローディング
 */
export const LoadingDots: React.FC<{
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}> = ({ color = 'primary', className = '' }) => {
  const colorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary-600',
    white: 'bg-white',
  };

  return (
    <div className={`flex space-x-2 ${className}`}>
      {[0, 1, 2].map(index => (
        <motion.div
          key={index}
          className={`w-3 h-3 rounded-full ${colorClasses[color]}`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: index * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

/**
 * パルスアニメーション付きローディング
 */
export const LoadingPulse: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}> = ({ size = 'md', color = 'primary', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const colorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary-600',
    white: 'bg-white',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`
          rounded-full 
          ${sizeClasses[size]} 
          ${colorClasses[color]}
        `}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};

export default LoadingSpinner;
