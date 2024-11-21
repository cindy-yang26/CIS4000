import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { FaEllipsisH, FaPlus, FaChevronLeft } from 'react-icons/fa';
import './CoursePage.css';

function CoursePage() {
  const { courseName } = useParams();
  const actualCourseName = courseName.replace(/-/g, ' ');
  const [assignments, setAssignments] = useState([
    'Spring 2021 MT2',
    'Fall 2020 MT1',
    'Spring 2022 Final',
  ]);
  const [menuVisible, setMenuVisible] = useState(null);
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

  const handleDeleteAssignment = (assignmentToDelete) => {
    setAssignments(assignments.filter((assignment) => assignment !== assignmentToDelete));
    setMenuVisible(null);
  };

  const toggleMenu = (index) => {
    if (menuVisible === index) {
      setMenuVisible(null);
    } else {
      setMenuVisible(index); 
    }
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
            <div key={index} className="assignment-card">
              <span
                className="assignment-name"
                onClick={() => handleViewAssignment(assignment)}
              >
                {assignment}
              </span>
              <FaEllipsisH
                className="options-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMenu(index);
                }}
              />
              {menuVisible === index && (
                <div className="menu">
                  <button
                    className="menu-item delete-button"
                    onClick={() => handleDeleteAssignment(assignment)}
                  >
                    Delete Assignment
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CoursePage;
