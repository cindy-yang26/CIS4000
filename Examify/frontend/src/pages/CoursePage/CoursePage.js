import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { FaEllipsisH, FaPlus, FaChevronLeft } from 'react-icons/fa';
import './CoursePage.css';

function CoursePage() {
  const { courseName } = useParams();
  const actualCourseName = courseName.replace(/-/g, ' ');
  const [assignments, setAssignments] = useState(['Spring 2021 MT2', 'Fall 2020 MT1', 'Spring 2022 Final']);
  const navigate = useNavigate();

  const handleViewQuestions = () => {
    navigate(`/course/${courseName}/questions`);
  };

  const handleReturnToMainPage = () => {
    navigate(`/home`);
  };

  const handleViewAssignment = (assignmentName) => {
    navigate(`/course/${courseName}/assignment/${assignmentName}`);
  };

  const handleCreateAssignment = () => {
    navigate(`/course/${courseName}/create-assignment`);
  };

  return (
    <div className="course-page">
      <Header />
      <div className="course-content">
        <div className="course-header">
          <button className="back-button" onClick={handleReturnToMainPage}>
            <FaChevronLeft />
          </button>
          <h2 className="course-name">{actualCourseName}</h2>
          <div className="course-buttons">
            <button className="add-assignment-button" onClick={handleCreateAssignment}>
              <FaPlus /> <span id="add-assignment-text">Create Assignment</span>
            </button>
            <button className="view-questions-button" onClick={handleViewQuestions}>
              View All Questions
            </button>
          </div>
        </div>
        <h3>Assignments</h3>
        <div className="assignments-list">
          {assignments.map((assignment, index) => (
            <div
              key={index}
              className="assignment-card"
              onClick={() => handleViewAssignment(assignment)}
            >
              <span className="assignment-name">{assignment}</span>
              <FaEllipsisH className="options-icon" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CoursePage;
