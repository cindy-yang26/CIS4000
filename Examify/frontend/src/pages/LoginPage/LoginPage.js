import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../api/auth';
import LoginHeader from '../../components/Header/LoginHeader';
import './LoginPage.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await login(username, password);
      navigate('/home');
    } catch (error) {
      alert("Login failed: ", error);
    }
  };

  const tryCookieLogin = async () => {
    try {
      await login(username, password);
      navigate('/home');
    } catch (error) {
      console.log("User is not logged in - no cookie found.");
    }
  }

  useEffect(() => {
    tryCookieLogin();
  }, []);

  return (
    <div className="login-page">
      <LoginHeader />
      <div className="login-container">
        <div className="login-shadow-box">
          <div className="login-box">

            <h1 className="login-welcome">Welcome back!</h1>
            <p className="login-welcome-text">Your all-in-one assignment design studio awaits...</p>

            <label htmlFor="username">Username</label>
            <input type="text" id="username" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} />
            
            <label htmlFor="password">Password</label>
            <input type="password" id="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />

            <div className="forgot-pw"><Link to="" className="link"><span className="text">Forgot password?</span></Link></div>

            <button className="login-button" onClick={handleLogin}>Log In</button>
            
            <div className="line"><span>OR</span></div>

            <Link to="/signup">
              <button className="create-account-button">Create new account</button>
            </Link>
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
