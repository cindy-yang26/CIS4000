import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <header className="header">
      <div className="logo">Examify</div>
      <div className="logout" onClick={handleLogout}>
        Logout
      </div>
    </header>
  );
}

export default Header;
