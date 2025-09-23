import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        {/* ロゴとタイトル */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <img 
              src="/unicred-icon.svg" 
              alt="Unicred Logo" 
              className="w-12 h-12 filter brightness-0 invert pointer-events-none select-none"
              draggable="false"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Unicred</h1>
          <p className="text-gray-600 text-lg">大阪大学履修支援システム</p>
        </div>

        {/* ログインボタン */}
        <Link
          href="/login"
          className="inline-block px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl"
        >
          ログイン
        </Link>

        {/* システム説明 */}
        <div className="mt-8 p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20 max-w-md mx-auto">
          <div className="flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span className="text-blue-800 font-medium">履修登録をサポート</span>
          </div>
          <p className="text-gray-700 text-sm">時間割作成、履修計画、成績管理を効率的に行えます</p>
        </div>
      </div>
    </main>
  );
}

