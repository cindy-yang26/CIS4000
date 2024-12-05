import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../../api/auth';
import LoginHeader from '../../components/Header/LoginHeader';
import './SignupPage.css';

function SignUpPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async () => {
    try {
      await signup(username, email, password);
      navigate('/home'); 
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div className="signup-page">
      <LoginHeader />
      <div className="signup-container">
        <div className="signup-shadow-box">
          <div className="signup-box">

            <h1 className="signup-welcome">Welcome to Examify!</h1>
            <p className="signup-welcome-text">Your one-stop-shop for assignment creation</p>

            <h2 className="create-acc">Create your account</h2>

            <label htmlFor="username">Username</label>
            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" />

            <label htmlFor="email">Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" />

            <label htmlFor="password">Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />

            <button className="signup-button" onClick={handleSignUp}>Sign Up</button>

            <div className="line"><span>OR</span></div>

            <Link to="/">
              <button className="create-account-button">Back to login</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
