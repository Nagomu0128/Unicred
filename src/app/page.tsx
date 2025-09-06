export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center p-10 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          ホームページ
        </h1>
        <p className="text-gray-600 mb-8">
          下のボタンをクリックしてログインページに進んでください。
        </p>
        {/* /loginページへのリンクをボタンとして表示 */}
        <a
          href="/public/login"
          className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          ログイン
        </a>
      </div>
    </main>
  );
}

