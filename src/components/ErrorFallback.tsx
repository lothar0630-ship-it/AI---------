import React from 'react';

interface ErrorFallbackProps {
  componentName: string;
  error?: Error;
  onRetry?: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  componentName,
  error,
  onRetry,
}) => {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <h3 className="text-red-800 font-semibold mb-2">コンポーネントエラー</h3>
      <p className="text-red-600 text-sm mb-3">
        {componentName} の読み込み中にエラーが発生しました。
      </p>

      {process.env.NODE_ENV === 'development' && error && (
        <details className="mb-3">
          <summary className="text-xs text-red-700 cursor-pointer">
            エラー詳細 (開発環境のみ)
          </summary>
          <pre className="text-xs text-red-600 mt-2 p-2 bg-red-100 rounded overflow-auto max-h-20">
            {error.message}
            {error.stack && `\n${error.stack}`}
          </pre>
        </details>
      )}

      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
        >
          再試行
        </button>
      )}
    </div>
  );
};

export default ErrorFallback;
