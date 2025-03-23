import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../../api/auth';
import LoginHeader from '../../components/Header/LoginHeader';
import Carousel from '../../components/Carousel';
import './LoginPage.css';

function ResetPasswordPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetSuccessful, setResetSuccessful] = useState(false);

  const handleResetPassword = async () => {
    setError('');
    setSuccess('');
  
    if (!username || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
  
    if (password.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }
  
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
  
    try {
      const response = await resetPassword(username, email, password);
      setSuccess(response);
      setResetSuccessful(true);
    } catch (errorMessage) {
      setError(errorMessage);
    }
  };
  
  return (
    <div className="login-page">
      <LoginHeader />
      <div className="content-container">
        <div className="login-container">
          {!resetSuccessful ? (
            <div className="login-box">
              <h1 className="login-welcome">Reset Your Password</h1>

              {error && <div className="error-message">{error}</div>}

              <label htmlFor="username">Username</label>
              <input 
                type="text" 
                id="username" 
                placeholder="Your username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
              />

              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email" 
                placeholder="Your email address" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
              
              <label htmlFor="password">New Password</label>
              <input 
                type="password" 
                id="password" 
                placeholder="Enter new password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />

              <label htmlFor="confirm-password">Confirm New Password</label>
              <input 
                type="password" 
                id="confirm-password" 
                placeholder="Confirm new password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
              />

              <button className="login-button" onClick={handleResetPassword}>Reset Password</button>
              
              <div className="line"><span>OR</span></div>

              <Link to="/" style={{ width: '100%', display: 'block' }}>
                <button className="create-account-button">Cancel</button>
              </Link>
            </div>
          ) : (
            <div className="login-box">
              <h1 className="login-welcome">Reset Your Password</h1>

              {success && <div className="error-message" id="success">{success}</div>}
  
              <Link to="/" style={{ width: '100%', display: 'block' }}>
                <button className="login-button">Back to Login</button>
              </Link>
            </div>
          )}
        </div>
        <Carousel />
      </div>
    </div>
  );
}

export default ResetPasswordPage;