import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { FaEllipsisH, FaPlus, FaChevronLeft } from 'react-icons/fa';
import { fetchAllAssignments, deleteAssignment } from '../../api/assignments';
import './CoursePage.css';

function CoursePage() {
  const { courseName } = useParams();
  const actualCourseName = courseName.replace(/-/g, ' ');
  const [assignments, setAssignments] = useState([]);
  const [menuVisible, setMenuVisible] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const data = await fetchAllAssignments();
        setAssignments(data);
      } catch (error) {
        alert('Failed to load assignments');
        console.error(error);
      }
    };

    loadAssignments();
  }, []);

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

  const handleDeleteAssignment = async (assignmentId, e) => {
    e.stopPropagation(); // Prevent the click event from propagating to the parent `onClick`
    try {
      await deleteAssignment(assignmentId);
      setAssignments(assignments.filter((assignment) => assignment.id !== assignmentId));
      setMenuVisible(null);
    } catch (error) {
      alert('Failed to delete assignment');
      console.error(error);
    }
  };

  const toggleMenu = (index, e) => {
    e.stopPropagation(); // Prevent the click event from propagating to the parent `onClick`
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
          {assignments.length > 0 ? (
            assignments.map((assignment, index) => (
              <div
                key={assignment.id}
                className="assignment-card"
                onClick={() => handleViewAssignment(assignment.name)}
              >
                <span className="assignment-name">{assignment.name}</span>
                <FaEllipsisH
                  className="options-icon"
                  onClick={(e) => toggleMenu(index, e)}
                />
                {menuVisible === index && (
                  <div className="menu">
                    <button
                      className="menu-item delete-button"
                      onClick={(e) => handleDeleteAssignment(assignment.id, e)}
                    >
                      Delete Assignment
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No assignments available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CoursePage;
