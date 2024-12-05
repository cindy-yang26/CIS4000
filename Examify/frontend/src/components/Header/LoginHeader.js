import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-regular-svg-icons';
import './Header.css';

function LoginHeader() {

  return (
    <header className="header">
      <div className="logo">
        <span className="icon"><FontAwesomeIcon icon={faCircleCheck} /></span>
        <span className="title">Examify</span>
      </div>
    </header>
  );
}

export default LoginHeader;