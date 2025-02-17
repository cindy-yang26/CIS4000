import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage/LoginPage';
import HomePage from './pages/HomePage/HomePage';
import SignupPage from './pages/SignupPage/SignupPage';
import CoursePage from './pages/CoursePage/CoursePage';
import QuestionsPage from './pages/QuestionsPage/QuestionsPage';
import AssignmentPage from './pages/AssignmentPage/AssignmentPage';
import CreateAssignmentPage from './pages/AssignmentPage/CreateAssignmentPage';
import EditAssignmentPage from './pages/AssignmentPage/EditAssignmentPage';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/course/:courseId" element={<CoursePage />} />
        <Route path="/course/:courseId/questions" element={<QuestionsPage />} />
        <Route path="/course/:courseId/assignment/:assignmentId" element={<AssignmentPage />} />
        <Route path="/course/:courseId/create-assignment" element={<CreateAssignmentPage />} />
        <Route path="/course/:courseId/assignment/:assignmentId/edit-assignment" element={<EditAssignmentPage />} />
      </Routes>
    </Router>
  );
}

export default App;