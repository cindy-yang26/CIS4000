import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { FaFolder, FaPlus, FaChevronLeft } from 'react-icons/fa';
import { fetchAllAssignments, deleteAssignment } from '../../api/assignments';
import './CoursePage.css';
import { FiMoreVertical, FiTrash2 } from 'react-icons/fi';
import { TiEdit } from 'react-icons/ti';

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
          <h2 className="course-name">
            {actualCourseName} <br></br> 
            <div className="assignment-header-div">
              Assignments
              <button className="add-assignment-button" onClick={handleCreateAssignment}>
                <FaPlus /> <span id="add-assignment-text">Create Assignment</span>
              </button>
            </div>
          </h2>
        </div>
        <button className="view-questions-button" onClick={handleViewQuestions}>
          View All Questions
        </button>

        <div className="assignments-list">
          {assignments.length > 0 ? (assignments.map((assignment, index) => (
              <div key={assignment.id} className="assignment-card" onClick={() => handleViewAssignment(assignment.name)}>
                <div className="course-assignment-info">
                  <FaFolder className="assignment-icon" />
                  <span className="assignment-name">{assignment.name}</span>
                </div>
                <FiMoreVertical
                  className="assignment-options-icon"
                  onClick={(e) => toggleMenu(index, e)}
                />
                {menuVisible === index && (
                  <div className="course-menu">
                    {/* <button className="course-menu-item rename">
                      <TiEdit /> Rename
                    </button> */}
                    <button
                      className="course-menu-item delete"
                      onClick={(e) => handleDeleteAssignment(assignment.id, e)}
                    >
                      <FiTrash2 /> Delete
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
