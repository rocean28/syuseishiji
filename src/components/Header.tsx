import React from 'react';

const Header: React.FC = () => {
  const apiBase = import.meta.env.VITE_API_BASE;
  const appUrl = import.meta.env.VITE_APP_URL;

  return (
    <header className="bg-white shadow sticky top-0 z-50">
    <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-800">修正指示ツール</h1>
      <div className="space-x-4">
        <a
          href={`${apiBase}/`}
          className="text-blue-600 hover:underline font-medium"
        >
          新規作成
        </a>
        <a
          href={`${appUrl}/list.php`}
          className="text-blue-600 hover:underline font-medium"
        >
          一覧
        </a>
      </div>
    </nav>
  </header>
  );
};

export default Header;