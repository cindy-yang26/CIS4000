import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { FaFolder, FaPlus, FaChevronLeft, FaSearch } from 'react-icons/fa';
import { FiMoreVertical } from 'react-icons/fi';
import { TiEdit } from "react-icons/ti";
import { RiDeleteBin6Line } from "react-icons/ri";
import { deleteAssignment, renameAssignment } from '../../api/assignments';
import './CoursePage.css';
import { fetchCourseAssignments, fetchCourseInfo } from '../../api/courses';

function CoursePage() {
  const { courseId } = useParams();
  const [actualCourseName, setActualCourseName] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [menuVisible, setMenuVisible] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLinkCanvas, setShowLinkCanvas] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [editedAssignmentName, setEditedAssignmentName] = useState("");
  const [canvasCourseId, setCanvasCourseId] = useState("");
  const [canvasToken, setCanvasToken] = useState("");
  const [showImportCanvasQuiz, setShowImportCanvasQuiz] = useState(false);
  const [canvasQuizId, setCanvasQuizId] = useState("");
  const [attemptDelete, setAttemptDelete] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  
  const navigate = useNavigate();

  const handleImportQuiz = async () => {
    const response = await fetch(`http://localhost:8080/api/courses/${courseId}/import-canvas-quiz/${canvasQuizId}`, {
      method: "POST",
      credentials: 'include'
    });

    if (response.ok) {
      alert("Canvas quiz imported successfully!");
      setShowImportCanvasQuiz(false);
      window.location.reload();
    } else {
      const errorData = await response.json();
      alert(`Failed to import Canvas quiz: ${errorData.message || JSON.stringify(errorData)}`);
      console.error("Failed to import Canvas quiz:", errorData);
    }
  };

  const handleLinkCanvas = async () => {
    const response = await fetch(`http://localhost:8080/api/courses/${courseId}/link-canvas`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: 'include',
      body: JSON.stringify({ canvasCourseId, canvasToken })
    });

    if (response.ok) {
      alert("Canvas course linked successfully!");
      setShowLinkCanvas(false);
    } else {
      const errorData = await response.json();
      console.error("Failed to link Canvas course:", errorData);
      alert(`Failed to link Canvas course: ${errorData.message || JSON.stringify(errorData)}`);
    }
  };

  useEffect(() => {
    const checkCanvasLink = async () => {
      try {
        const courseInfo = await fetchCourseInfo(courseId, navigate);
        if (courseInfo == null) {
          return;
        }
        if (courseInfo.canvasCourseId) {
          document.getElementById("link-canvas-button").innerHTML = "Linked!"
          document.getElementById("link-canvas-button").style.backgroundColor = "green";

          document.getElementById("import-canvas-quiz-button").style.backgroundColor = "#f0ad4e";
          document.getElementById("import-canvas-quiz-button").style.cursor = "pointer";
          document.getElementById("import-canvas-quiz-button").style.border = "none";
        } else {
          document.getElementById("import-canvas-quiz-button").disabled = true;
          document.getElementById("import-canvas-quiz-button").style.backgroundColor = "#e0e0e0";
          document.getElementById("import-canvas-quiz-button").style.cursor = "default";
        }
      } catch (error) {
        alert('Failed to fetch Canvas data');
        console.error(error);
      }
    };

    checkCanvasLink();
  }, [courseId, navigate]);

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
  }, [courseId, navigate]);

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

  const handleRenameAssignment = async (assignment) => {
    if (!editedAssignmentName.trim()) {
      alert("Assignment name cannot be empty.");
      return;
    }

    try {
      const updatedAssignment = await renameAssignment(assignment.id, { name: editedAssignmentName });

      if (updatedAssignment) {
        setAssignments(assignments.map((a) => (a.id === assignment.id ? updatedAssignment : a)));
      }
      setEditingAssignmentId(null);
      setMenuVisible(null);
    } catch (error) {
      console.error("Error renaming assignment:", error);
      alert("Failed to rename assignment.");
    }
  };

  const handleDeleteAssignment = async () => {
    if (!courseToDelete) return;
    
    try {
      await deleteAssignment(courseToDelete.id, navigate);
      setAssignments(assignments.filter((assignment) => assignment.id !== courseToDelete.id));
      setAttemptDelete(false);
      setCourseToDelete(null);
    } catch (error) {
      alert('Failed to delete assignment');
      console.error(error);
    }
  };

  const confirmDelete = (assignment, e) => {
    e.stopPropagation();
    setCourseToDelete(assignment);
    setAttemptDelete(true);
    setMenuVisible(null);
  };

  const toggleMenu = (index, e) => {
    e.stopPropagation();
    setMenuVisible(menuVisible === index ? null : index);
  };

  const closeModals = (e) => {
    if (e) e.stopPropagation();
    setShowLinkCanvas(false);
    setShowImportCanvasQuiz(false);
    setAttemptDelete(false);
    setCourseToDelete(null);
  };

  const filteredAssignments = assignments.filter((assignment) => {
    return assignment.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="course-page">
      <Header />
      <div className="course-content">
        {/* Header with everything in one row */}
        <div className="course-header">
          {/* Left side with back button and title */}
          <div className="header-left">
            <button className="back-button" onClick={handleReturnToMainPage}>
              <FaChevronLeft />
            </button>
            
            <div className="course-title-section">
              <h2 className="course-name">{actualCourseName}</h2>
              <div className="assignment-header-div">Assignments</div>
            </div>
          </div>
          
          {/* Right side with Canvas card and action buttons */}
          <div className="header-right">
            <div className="canvas-div">
              <div id="canvas-logo">
                <img src="/canvas_logo.png" alt="Canvas Logo" id="canvas-image" />
                <span id="canvas-text">Canvas</span>
              </div>
              <div id="canvas-buttons">
                <div>
                  <button
                    id="link-canvas-button"
                    onClick={() => setShowLinkCanvas(true)}
                  >
                    Link
                  </button>
                </div>
                <div>
                  <button
                    id="import-canvas-quiz-button"
                    onClick={() => setShowImportCanvasQuiz(true)}
                  >
                    Import Quiz
                  </button>
                </div>
              </div>
            </div>
            
            <div id="button-div">
              <button className="add-assignment-button" onClick={handleCreateAssignment}>
                <FaPlus className="add-icon" /> Create Assignment
              </button>
              <button className="view-questions-button" onClick={handleViewQuestions}>
                View All Questions
              </button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <div className="assignments-search-div">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="assignment-search-input"
          />
        </div>

        {/* Assignments list */}
        <div className="assignments-list">
          {filteredAssignments.length > 0 ? (
            filteredAssignments.map((assignment, index) => (
              <div key={assignment.id} className="assignment-card" onClick={() => handleViewAssignment(assignment.id)}>
                <div className="course-assignment-info">
                  <FaFolder className="assignment-icon" />
                  {editingAssignmentId === assignment.id ? (
                    <input
                      type="text"
                      value={editedAssignmentName}
                      onChange={(e) => setEditedAssignmentName(e.target.value)}
                      onBlur={() => handleRenameAssignment(assignment)}
                      onKeyDown={(e) => e.key === "Enter" && handleRenameAssignment(assignment)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  ) : (
                    <span className="assignment-name">{assignment.name}</span>
                  )}
                </div>
                <FiMoreVertical
                  className="assignment-options-icon"
                  onClick={(e) => toggleMenu(index, e)}
                />
                {menuVisible === index && (
                  <div className="course-menu">
                    <button
                      className="course-menu-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingAssignmentId(assignment.id);
                        setEditedAssignmentName(assignment.name);
                        setMenuVisible(null);
                      }}
                    >
                      <TiEdit /> Rename
                    </button>
                    <button 
                      className="course-menu-item"
                      onClick={(e) => confirmDelete(assignment, e)}
                    >
                      <RiDeleteBin6Line /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No assignments found. Create an assignment to get started.</p>
          )}
        </div>

        {/* Modals */}
        {showLinkCanvas && (
          <div className="modal-background" onClick={closeModals}>
            <div className="link-canvas-window" onClick={(e) => e.stopPropagation()}>
              <h3 id="link-canvas-title">Link Canvas Course</h3>
              <input
                className="link-canvas-input"
                type="text"
                placeholder="Enter Canvas Course ID"
                value={canvasCourseId}
                onChange={(e) => setCanvasCourseId(e.target.value)}
              />
              <input
                className="link-canvas-input"
                type="password"
                placeholder="Enter Canvas Token"
                value={canvasToken}
                onChange={(e) => setCanvasToken(e.target.value)}
              />
              <div className="window-button-div">
                <button className="link-canvas-window-button" id="add-course-button" onClick={handleLinkCanvas}>Link Canvas</button>
                <button className="link-canvas-window-button" id="link-canvas-cancel" onClick={closeModals}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showImportCanvasQuiz && (
          <div className="modal-background" onClick={closeModals}>
            <div className="link-canvas-window" onClick={(e) => e.stopPropagation()}>
              <h3 id="link-canvas-title">Import Quiz from Canvas</h3>
              <input
                className="link-canvas-input"
                type="text"
                placeholder="Enter Canvas Quiz ID"
                value={canvasQuizId}
                onChange={(e) => setCanvasQuizId(e.target.value)}
              />
              <div className="window-button-div">
                <button className="link-canvas-window-button" id="import-quiz-button" onClick={handleImportQuiz}>Import Quiz</button>
                <button className="link-canvas-window-button" id="import-quiz-cancel" onClick={closeModals}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {attemptDelete && (
          <div className="modal-background" onClick={closeModals}>
            <div className="link-canvas-window" onClick={(e) => e.stopPropagation()}>
              <h3 id="link-canvas-title">Delete Assignment?</h3>
              <p className="modal-message">This action cannot be undone.</p>
              <div className="window-button-div">
                <button 
                  className="link-canvas-window-button" 
                  id="add-course-button" 
                  onClick={handleDeleteAssignment}
                >
                  Delete
                </button>
                <button 
                  className="link-canvas-window-button" 
                  id="add-course-cancel"
                  onClick={closeModals}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CoursePage;