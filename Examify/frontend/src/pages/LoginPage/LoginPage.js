import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../api/auth';
import Header from '../../components/Header/Header';
import './LoginPage.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await login(username, password);
      navigate('/home')
    } catch (error) {
      alert("Login failed");
    }
  };

  return (
    <div className="login-page">
      <Header />
      <div className="login-container">
        <div className="login-box">
          <label htmlFor="username">Username</label>
          <input type="text" id="username" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} />
          
          <label htmlFor="password">Password</label>
          <input type="password" id="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
          
          <button className="login-button" onClick={handleLogin}>Log In</button>
          
          <hr />
          
          <Link to="/signup">
            <button className="create-account-button">Create new account</button>
          </Link>
          
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
