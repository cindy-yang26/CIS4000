import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import HomePage from './pages/HomePage/HomePage';
import SignupPage from './pages/SignupPage/SignupPage';
import CoursePage from './pages/CoursePage/CoursePage';
import QuestionsPage from './pages/QuestionsPage/QuestionsPage';
import AssignmentPage from './pages/AssignmentPage/AssignmentPage';
import CreateAssignmentPage from './pages/AssignmentPage/CreateAssignmentPage';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/course/:courseName" element={<CoursePage />} />
        <Route path="/course/:courseName/questions" element={<QuestionsPage />} />
        <Route path="/course/:courseName/assignment/:assignmentName" element={<AssignmentPage />} />
        <Route path="/course/:courseName/create-assignment" element={<CreateAssignmentPage />} />
      </Routes>
    </Router>
  );
}

export default App;