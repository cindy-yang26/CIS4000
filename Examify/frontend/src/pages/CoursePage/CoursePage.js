import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { FaFolder, FaPlus, FaChevronLeft } from 'react-icons/fa';
import { deleteAssignment, renameAssignment } from '../../api/assignments';
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
  const [showLinkCanvas, setShowLinkCanvas] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [editedAssignmentName, setEditedAssignmentName] = useState("");
  const [canvasCourseId, setCanvasCourseId] = useState("");
  const [canvasToken, setCanvasToken] = useState("");
  const [showImportCanvasQuiz, setShowImportCanvasQuiz] = useState(false);
  const [canvasQuizId, setCanvasQuizId] = useState("");
  const [attemptDelete, setAttemptDelete] = useState(false)
  
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

          document.getElementById("import-canvas-quiz-button").style.backgroundColor = "#c4c000";
          document.getElementById("import-canvas-quiz-button").style.cursor = "pointer";
          document.getElementById("import-canvas-quiz-button").style.border = "1px solid black";
        } else {
          document.getElementById("import-canvas-quiz-button").disabled = true;
        }
      } catch (error) {
        alert('Failed to fetch Canvas data');
        console.error(error);
      }
    };

    checkCanvasLink();
  }, []);

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

  const handleDeleteAssignment = async (assignmentId, e) => {
    e.stopPropagation();
    try {
      await deleteAssignment(assignmentId, navigate);
      setAssignments(assignments.filter((assignment) => assignment.id !== assignmentId));
      setMenuVisible(null);
      setAttemptDelete(false);
    } catch (error) {
      alert('Failed to delete assignment');
      console.error(error);
    }
  };

  const toggleMenu = (index, e) => {
    e.stopPropagation();
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
            </div>
          </h2>
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
            <div id="button-div">
              <button className="add-assignment-button" onClick={handleCreateAssignment}>
                {/* <FaPlus /> <span id="add-assignment-text">Create Assignment</span> */}
                Create Assignment
              </button>
              <button className="view-questions-button" onClick={handleViewQuestions}>
                View All Questions
              </button>
            </div>
          </div>
        </div>

        <div className="assignments-list">
          {filteredAssignments.length > 0 ? (filteredAssignments.map((assignment, index) => (
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
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMenu(index, e);
                }}
              />
              {menuVisible === index && (
                <div className="course-menu">
                  <button
                    className="course-menu-item rename"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingAssignmentId(assignment.id);
                      setEditedAssignmentName(assignment.name);
                    }}
                  >
                    <TiEdit /> Rename
                  </button>
                  <button
                    className="course-menu-item delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAttemptDelete(true);
                      setMenuVisible(null)
                    }
                    }
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              )}
              {attemptDelete && (
                <div className="modal-background">
                  <div className="delete-confirmation-window">
                    <h3 id="link-canvas-title">Delete Assignment?</h3>
                    <p>This action can not be undone</p>
                    <div className="window-button-div">
                      <button 
                        className="link-canvas-window-button" id="add-course-button" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAssignment(assignment.id, e)
                        }}
                      >
                        Delete
                      </button>
                      <button 
                        className="link-canvas-window-button" id="add-course-cancel"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAttemptDelete(false)
                          setMenuVisible(null)
                        }}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
          ) : (
            <p></p>
          )}
        </div>
        {showLinkCanvas ? (
          <div className="modal-background">
            <div className="link-canvas-window">
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
                <button className="link-canvas-window-button" onClick={handleLinkCanvas}>Link Canvas</button>
                <button className="link-canvas-window-button" id="link-canvas-cancel" onClick={() => setShowLinkCanvas(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (<div></div>)}
        {showImportCanvasQuiz ? (
          <div className="modal-background">
            <div className="link-canvas-window">
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
                <button className="link-canvas-window-button" id="import-quiz-cancel" onClick={() => setShowImportCanvasQuiz(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (<div></div>)}
      </div>
    </div>
  );
}

export default CoursePage;
