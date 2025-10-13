import React from 'react';

interface NotFoundPageProps {
  onGoHome?: () => void;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ onGoHome }) => {
  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-primary mb-4">404</div>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full mb-6"></div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-800 mb-4">
            ページが見つかりません
          </h1>
          <p className="text-lg text-secondary-600 leading-relaxed">
            お探しのページは存在しないか、
            <br />
            移動または削除された可能性があります。
          </p>
        </div>

        {/* Suggestions */}
        <div className="bg-secondary-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-secondary-800 mb-3">
            以下をお試しください:
          </h3>
          <ul className="text-secondary-600 space-y-2 text-left">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              URLが正しく入力されているか確認してください
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              ブラウザの戻るボタンで前のページに戻る
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              ホームページから目的のコンテンツを探す
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoHome}
            className="w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-600 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            ホームページに戻る
          </button>

          <button
            onClick={() => window.history.back()}
            className="w-full bg-secondary-100 text-secondary-700 py-3 px-6 rounded-lg font-medium hover:bg-secondary-200 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            前のページに戻る
          </button>
        </div>

        {/* Footer Message */}
        <p className="text-sm text-secondary-500 mt-8">
          それでも問題が解決しない場合は、しばらく時間をおいてから再度アクセスしてください。
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;
