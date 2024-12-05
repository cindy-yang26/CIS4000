import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-regular-svg-icons';
import { useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <header className="header">
      <div className="logo">
        <span className="icon"><FontAwesomeIcon icon={faCircleCheck} /></span>
        <span className="title">Examify</span>
      </div>
      <div className="logout" onClick={handleLogout}>
        Logout
      </div>
    </header>
  );
}

export default Header;
