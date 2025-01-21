import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { FaFolder, FaPlus, FaChevronLeft } from 'react-icons/fa';
import { deleteAssignment } from '../../api/assignments';
import './CoursePage.css';
import { FiMoreVertical, FiTrash2 } from 'react-icons/fi';
import { TiEdit } from 'react-icons/ti';
import { fetchCourseAssignments, fetchCourseInfo } from '../../api/courses';

function CoursePage() {
  const { courseId } = useParams();
  const [actualCourseName, setActualCourseName] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [menuVisible, setMenuVisible] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadCourseName = async () => {
      try {
        const courseInfo = await fetchCourseInfo(courseId, navigate);
        if (courseInfo == null) {
          return;
        }
        setActualCourseName(courseInfo.courseCode.replace(/-/g, ' '));
      } catch (error) {
        alert('Failed to load course name');
        console.error(error);
      }
    };
    const loadAssignments = async () => {
      try {
        const data = await fetchCourseAssignments(courseId, navigate);
        setAssignments(data);
      } catch (error) {
        alert('Failed to load assignments');
        console.error(error);
      }
    };

    loadCourseName();
    loadAssignments();
  }, [courseId]);

  const handleViewQuestions = () => {
    navigate(`/course/${courseId}/questions`);
  };

  const handleReturnToMainPage = () => {
    navigate(`/home`);
  };

  const handleViewAssignment = (assignmentId) => {
    navigate(`/course/${courseId}/assignment/${assignmentId}`);
  };

  const handleCreateAssignment = () => {
    navigate(`/course/${courseId}/create-assignment`);
  };

  const handleDeleteAssignment = async (assignmentId, e) => {
    e.stopPropagation(); // Prevent the click event from propagating to the parent `onClick`
    try {
      await deleteAssignment(assignmentId, navigate);
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

  const filteredAssignments = assignments.filter((assignment, index) => {
    const name = assignment.name;
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

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
        <div className="course-second-div">
          <div id="spacer"></div>
          <div className="assignments-search-div">
            <input
              type="text"
              placeholder=" 🔍 Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="assignment-search-input"
            />
          </div>
          <button className="view-questions-button" onClick={handleViewQuestions}>
            View All Questions
          </button>
        </div>

        <div className="assignments-list">
          {filteredAssignments.length > 0 ? (filteredAssignments.map((assignment, index) => (
            <div key={assignment.id} className="assignment-card" onClick={() => handleViewAssignment(assignment.id)}>
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
            <p>No assignments created yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CoursePage;
