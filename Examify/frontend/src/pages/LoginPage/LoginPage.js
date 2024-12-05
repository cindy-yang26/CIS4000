import React, { useState } from 'react';
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
      navigate('/home')
    } catch (error) {
      alert("Login failed");
    }
  };

  return (
    <div className="login-page">
      <LoginHeader />
      <div className="login-container">
        <div className="shadow-box">
          <div className="login-box">

            <h1>Welcome back!</h1>
            <p>Your all-in-one assignment design studio awaits...</p>

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
