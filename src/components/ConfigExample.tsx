import React from 'react';
import {
  useConfig,
  usePersonalInfo,
  useYouTubeChannels,
  useSocialLinks,
  useTheme,
} from '../hooks';

/**
 * 設定データの使用例を示すコンポーネント
 * 実際のアプリケーションでは、各セクションコンポーネントで個別のフックを使用します
 */
export const ConfigExample: React.FC = () => {
  // 全体の設定を取得
  const { config, loading, error } = useConfig();

  // 個別の設定項目を取得（最適化されたアクセス）
  const { personalInfo } = usePersonalInfo();
  const { channels } = useYouTubeChannels();
  const { socialLinks } = useSocialLinks();
  const { theme } = useTheme();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">設定を読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <h3 className="text-red-800 font-semibold">設定の読み込みエラー</h3>
        <p className="text-red-600">{error}</p>
        <p className="text-sm text-red-500 mt-2">
          デフォルト設定を使用して表示を続行します。
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        設定データの表示例
      </h1>

      {/* 個人情報セクション */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2
          className="text-2xl font-semibold mb-4"
          style={{ color: theme.primaryColor }}
        >
          個人情報
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              名前
            </label>
            <p className="text-lg">{personalInfo.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              職業
            </label>
            <p className="text-lg">{personalInfo.title}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              自己紹介
            </label>
            <p className="text-base text-gray-600">
              {personalInfo.description}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              アバター
            </label>
            <img
              src={personalInfo.avatar}
              alt={personalInfo.name}
              className="w-16 h-16 rounded-full object-cover"
              onError={e => {
                e.currentTarget.src = '/images/default-avatar.jpg';
              }}
            />
          </div>
        </div>
      </section>

      {/* YouTubeチャンネルセクション */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2
          className="text-2xl font-semibold mb-4"
          style={{ color: theme.primaryColor }}
        >
          YouTubeチャンネル ({channels.length}個)
        </h2>
        {channels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {channels.map(channel => (
              <div key={channel.id} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg">{channel.name}</h3>
                <p className="text-gray-600 text-sm mb-2">
                  {channel.description}
                </p>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>ID:</strong> {channel.id}
                  </p>
                  {channel.customUrl && (
                    <p>
                      <strong>カスタムURL:</strong> {channel.customUrl}
                    </p>
                  )}
                  <a
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    チャンネルを見る
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            YouTubeチャンネルが設定されていません。
          </p>
        )}
      </section>

      {/* ソーシャルリンクセクション */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2
          className="text-2xl font-semibold mb-4"
          style={{ color: theme.primaryColor }}
        >
          ソーシャルメディア ({socialLinks.length}個)
        </h2>
        {socialLinks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                  <span className="text-sm font-semibold">
                    {link.platform.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{link.label}</p>
                  <p className="text-sm text-gray-500">{link.platform}</p>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            ソーシャルメディアリンクが設定されていません。
          </p>
        )}
      </section>

      {/* テーマ設定セクション */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2
          className="text-2xl font-semibold mb-4"
          style={{ color: theme.primaryColor }}
        >
          テーマ設定
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              プライマリカラー
            </label>
            <div
              className="w-16 h-16 rounded-full mx-auto border-2 border-gray-300"
              style={{ backgroundColor: theme.primaryColor }}
            ></div>
            <p className="text-sm mt-2">{theme.primaryColor}</p>
          </div>
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              セカンダリカラー
            </label>
            <div
              className="w-16 h-16 rounded-full mx-auto border-2 border-gray-300"
              style={{ backgroundColor: theme.secondaryColor }}
            ></div>
            <p className="text-sm mt-2">{theme.secondaryColor}</p>
          </div>
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              アクセントカラー
            </label>
            <div
              className="w-16 h-16 rounded-full mx-auto border-2 border-gray-300"
              style={{ backgroundColor: theme.accentColor }}
            ></div>
            <p className="text-sm mt-2">{theme.accentColor}</p>
          </div>
        </div>
      </section>

      {/* 設定ファイルの生データ表示（開発用） */}
      <section className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">設定データ（JSON）</h2>
        <pre className="bg-white p-4 rounded border overflow-x-auto text-sm">
          {JSON.stringify(config, null, 2)}
        </pre>
      </section>
    </div>
  );
};
