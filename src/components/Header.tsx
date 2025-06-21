import React from 'react';

const Header: React.FC = () => {
  const apiBase = import.meta.env.VITE_API_BASE;
  const appUrl = import.meta.env.VITE_APP_URL;

  return (
    <header className="header">
      <h1 className="header__logo">
        <a href={`${appUrl}/list.php`} className="header__logoLink">Syusei</a>
      </h1>
      <nav className="header__nav">
        <a href={`${appUrl}/list.php`} className="header__navLink">
          <i className="fa-solid fa-list-ul"></i>
        </a>
        <a href={`${apiBase}`} className="header__navLink btn-new">
          <i className="fa-solid fa-plus"></i>
        </a>
      </nav>
    </header>
  );
};

export default Header;
