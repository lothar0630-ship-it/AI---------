import React from 'react';
import { useYouTubeData, useYouTubeAvailability } from '../hooks';
import { useYouTubeChannels } from '../hooks/useConfig';

/**
 * YouTube API 連携のデモンストレーション用コンポーネント
 */
export const YouTubeExample: React.FC = () => {
  const { channels, loading: configLoading } = useYouTubeChannels();
  const { isAvailable, hasApiKey } = useYouTubeAvailability();
  const { data: youtubeData, isLoading, error } = useYouTubeData(channels);

  if (configLoading) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          YouTube API キーが設定されていません
        </h3>
        <p className="text-yellow-700">
          .env ファイルに VITE_YOUTUBE_API_KEY を設定してください。
        </p>
      </div>
    );
  }

  if (!isAvailable) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          YouTube API が利用できません
        </h3>
        <p className="text-red-700">
          YouTube API クライアントの初期化に失敗しました。
        </p>
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          YouTube チャンネルが設定されていません
        </h3>
        <p className="text-blue-700">
          config.json ファイルに youtubeChannels を設定してください。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          YouTube チャンネル情報
        </h2>

        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">動画情報を読み込み中...</p>
          </div>
        )}

        {error.videos && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-800">動画取得エラー:</h4>
            <pre className="text-sm text-red-700 mt-1">
              {JSON.stringify(error.videos, null, 2)}
            </pre>
          </div>
        )}

        {error.channels && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-800">
              チャンネル情報取得エラー:
            </h4>
            <pre className="text-sm text-red-700 mt-1">
              {JSON.stringify(error.channels, null, 2)}
            </pre>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {youtubeData.map(channelData => (
            <div
              key={channelData.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {channelData.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {channelData.description}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    channelData.hasApiData
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {channelData.hasApiData ? 'API連携' : '設定ファイル'}
                </span>
              </div>

              <div className="mb-3">
                <a
                  href={channelData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-600 text-sm font-medium"
                >
                  チャンネルを見る →
                </a>
              </div>

              {channelData.videos && channelData.videos.length > 0 && (
                <div className="border-t pt-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    最新動画:
                  </h4>
                  {channelData.videos.map(video => (
                    <div key={video.id} className="flex space-x-3">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-16 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-gray-800 hover:text-primary line-clamp-2"
                        >
                          {video.title}
                        </a>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(video.publishedAt).toLocaleDateString(
                            'ja-JP'
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(!channelData.videos || channelData.videos.length === 0) && (
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-500">
                    動画情報を取得できませんでした
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          デバッグ情報
        </h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>API キー設定: {hasApiKey ? '✅' : '❌'}</p>
          <p>API 利用可能: {isAvailable ? '✅' : '❌'}</p>
          <p>設定チャンネル数: {channels.length}</p>
          <p>読み込み状態: {isLoading ? '読み込み中' : '完了'}</p>
        </div>
      </div>
    </div>
  );
};
