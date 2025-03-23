import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../../api/auth';
import LoginHeader from '../../components/Header/LoginHeader';
import Carousel from '../../components/Carousel';
import './SignupPage.css';

function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      setErrors({});
      await signup(username, email, password);
      navigate('/home');
    } catch (error) {
      const errorMessage = error.message || "Signup failed";
      if (errorMessage.includes("Username")) {
        setErrors(prev => ({ ...prev, username: errorMessage }));
      } else if (errorMessage.includes("Email")) {
        setErrors(prev => ({ ...prev, email: errorMessage }));
      } else if (errorMessage.includes("Password")) {
        setErrors(prev => ({ ...prev, password: errorMessage }));
      } else {
        setErrors(prev => ({ ...prev, general: errorMessage }));
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSignup();
    }
  };

  return (
    <div className="signup-page">
      <LoginHeader />
      <div className="content-container">
        <div className="signup-container">
          <div className="signup-box">
            <h1 className="signup-welcome">Welcome to Examify!</h1>
            <p className="signup-welcome-text">Your all-in-one assignment design studio awaits...</p>

            <h2 className="create-acc">Create your account</h2>

            {errors.general && <div className="error-message">{errors.general}</div>}

            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              className={errors.username ? 'input-error' : ''}
              placeholder="Your username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              onKeyDown={handleKeyDown}
            />
            {errors.username && <div className="field-error">{errors.username}</div>}

            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              className={errors.email ? 'input-error' : ''}
              placeholder="Your email address"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              onKeyDown={handleKeyDown}
            />
            {errors.email && <div className="field-error">{errors.email}</div>}

            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              className={errors.password ? 'input-error' : ''}
              placeholder="Your password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              onKeyDown={handleKeyDown}
            />
            {errors.password && <div className="field-error">{errors.password}</div>}

            <button className="signup-button" onClick={handleSignup}>Sign Up</button>
            
            <div className="line"><span>OR</span></div>

            <Link to="/" style={{ width: '100%', display: 'block' }}>
              <button className="login-account-button">Back to login</button>
            </Link>
          </div>
        </div>
        <Carousel />
      </div>
    </div>
  );
}

export default SignupPage;