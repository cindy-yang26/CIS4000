import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import HomePage from './pages/HomePage/HomePage';
import SignupPage from './pages/SignupPage/SignupPage';
import CoursePage from './pages/CoursePage/CoursePage';
import QuestionsPage from './pages/QuestionsPage/QuestionsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/course/:courseName" element={<CoursePage />} />
        <Route path="/course/:courseName/questions" element={<QuestionsPage />} />
      </Routes>
    </Router>
  );
}

export default App;