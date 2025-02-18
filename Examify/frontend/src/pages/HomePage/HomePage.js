import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import { useNavigate } from 'react-router-dom';
import { createCourse, deleteCourse, fetchAllCourses, updateCourse } from '../../api/courses';
import './HomePage.css';
import { FaFolder, FaPlus } from 'react-icons/fa';
import { FiMoreVertical, FiTrash2 } from 'react-icons/fi';
import { TiEdit } from "react-icons/ti";


function HomePage() {
  const [courses, setCourses] = useState([]);
  const [menuVisible, setMenuVisible] = useState(null);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCourse, setNewCourse] = useState({ courseCode: "", professor: "" });
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editedCourseCode, setEditedCourseCode] = useState("");
  const [attemptDelete, setAttemptDelete] = useState(false)

  useEffect(() => {
    const loadCourses = async () => {
      const newCourseInfo = await fetchAllCourses(navigate);
      console.log(newCourseInfo);
      setCourses(newCourseInfo);
    };
    loadCourses();
  }, []);

  const handleCourseClick = (course) => {
    navigate(`/course/${course.id}`);
  };

  const handleAddCourse = async () => {
    if (!newCourse.courseCode || !newCourse.professor) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const addedCourse = await createCourse(newCourse, navigate);
      setCourses([...courses, addedCourse]);
      setShowAddForm(false);
      setNewCourse({ courseCode: "", professor: "" }); 
    } catch (error) {
      console.error("Error adding course:", error);
    }
  };

  const handleRenameCourse = async (course) => {
    if (!editedCourseCode.trim()) {
      alert("Course name cannot be empty.");
      return;
    }

    try {
      const updatedCourse = await updateCourse(course.id, { courseCode: editedCourseCode });
      setCourses(courses.map((c) => (c.id === course.id ? updatedCourse : c)));
      setEditingCourseId(null);
      setMenuVisible(null);
    } catch (error) {
      console.error("Error renaming course:", error);
      alert("Failed to rename course.");
    }
  };

  const handleDeleteCourse = (courseToDelete) => {
    const idToDelete = courseToDelete.id;
    deleteCourse(idToDelete, navigate);
    setCourses(courses.filter((course) => course.id !== idToDelete));
    setMenuVisible(null);
    setAttemptDelete(false);
  };

  const toggleMenu = (index) => {
    if (menuVisible === index) {
      setMenuVisible(null);
    } else {
      setMenuVisible(index);
    }
  };

  const filteredCourses = courses.filter((course, index) => {
    const title = course.courseCode;
    return (
      title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="home-page">
      <Header />
      <div className="home-content">

        <div className="courses-header">
          <h1 className="courses-title">My Courses</h1>
          <button className="new-course-button" onClick={() => setShowAddForm(!showAddForm)}>
            <FaPlus /><span className="add-course">Add Course</span>
          </button>
        </div>

        <div className="courses-search-div">
          <input
            type="text"
            placeholder=" 🔍 Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="question-search-input"
          />
        </div>

        <div className="courses-list">
          {filteredCourses.map((course, index) => (
            <div key={course.id} className="home-course-card" onClick={() => handleCourseClick(course)}>
              <div className="home-course-info">
                <FaFolder className="home-course-icon" />
                {editingCourseId === course.id ? (
                  <input
                    type="text"
                    value={editedCourseCode}
                    onChange={(e) => setEditedCourseCode(e.target.value)}
                    onBlur={() => handleRenameCourse(course)}
                    onKeyDown={(e) => e.key === "Enter" && handleRenameCourse(course)}
                    autoFocus
                  />
                ) : (
                  <span className="home-course-name">{course.courseCode}</span>
                )}
              </div>
              <FiMoreVertical
                className="home-options-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMenu(index);
                }}
              />
              {menuVisible === index && (
                <div className="home-menu">
                  <button
                    className="home-menu-item rename"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCourseId(course.id);
                      setEditedCourseCode(course.courseCode);
                    }}
                  >
                    <TiEdit /> Rename
                  </button>
                  <button className="home-menu-item delete" onClick={(e) => {
                    e.stopPropagation();
                    setAttemptDelete(true);
                    setMenuVisible(null)
                    }}>
                    <FiTrash2 /> Delete
                  </button>
                </div>
              )}
              {attemptDelete && (
                <div className="modal-background">
                  <div className="delete-confirmation-window">
                    <h3 id="link-canvas-title">Delete Course?</h3>
                    <p>This action can not be undone</p>
                    <div className="window-button-div">
                      <button 
                        className="link-canvas-window-button" id="add-course-button" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCourse(course)
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
          ))}
        </div>
        {showAddForm ? (
          <div className="modal-background">
            <div className="link-canvas-window">
              <h3 id="link-canvas-title">Add a Course</h3>
              <input
                className="link-canvas-input"
                type="text"
                placeholder="Course Code"
                value={newCourse.courseCode}
                onChange={(e) => setNewCourse({ ...newCourse, courseCode: e.target.value })}
              />
              <input
                className="link-canvas-input"
                type="text"
                placeholder="Professor Name"
                value={newCourse.professor}
                onChange={(e) => setNewCourse({ ...newCourse, professor: e.target.value })}
              />
              <div className="window-button-div">
                <button className="link-canvas-window-button" id="add-course-button" onClick={handleAddCourse}>Add Course</button>
                <button className="link-canvas-window-button" id="add-course-cancel" onClick={() => setShowAddForm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
