import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { signup } from '../../api/auth';
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
      alert("Signup failed");
    }
  };

  return (
    <div className="signup-page">
      <Header />
      <div className="signup-container">
        <div className="signup-box">
          <label htmlFor="username">Username</label>
          <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" />

          <label htmlFor="email">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" />

          <label htmlFor="password">Password</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />

          <button className="signup-button" onClick={handleSignUp}>Sign Up</button>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
