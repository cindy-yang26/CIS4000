import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import { useNavigate } from 'react-router-dom';
import { createCourse, deleteCourse, fetchAllCourses, updateCourse } from '../../api/courses';
import './HomePage.css';
import { FaFolder, FaPlus, FaSearch } from 'react-icons/fa';
import { FiMoreVertical } from 'react-icons/fi';
import { TiEdit } from "react-icons/ti";
import { RiDeleteBin6Line } from "react-icons/ri";

function HomePage() {
  const [courses, setCourses] = useState([]);
  const [menuVisible, setMenuVisible] = useState(null);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCourse, setNewCourse] = useState({ courseCode: "", professor: "" });
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editedCourseCode, setEditedCourseCode] = useState("");
  const [attemptDelete, setAttemptDelete] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  useEffect(() => {
    const loadCourses = async () => {
      const newCourseInfo = await fetchAllCourses(navigate);
      setCourses(newCourseInfo || []);
    };
    loadCourses();
  }, [navigate]);

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

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    
    try {
      await deleteCourse(courseToDelete.id, navigate);
      setCourses(courses.filter((course) => course.id !== courseToDelete.id));
      setAttemptDelete(false);
      setCourseToDelete(null);
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Failed to delete course.");
    }
  };

  const confirmDelete = (course, e) => {
    e.stopPropagation();
    setCourseToDelete(course);
    setAttemptDelete(true);
    setMenuVisible(null);
  };

  const toggleMenu = (index, e) => {
    e.stopPropagation();
    setMenuVisible(menuVisible === index ? null : index);
  };

  const filteredCourses = courses.filter((course) => {
    return course.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const closeModals = (e) => {
    if (e) e.stopPropagation();
    setShowAddForm(false);
    setAttemptDelete(false);
    setCourseToDelete(null);
  };

  return (
    <div className="home-page">
      <Header />
      <div className="home-content">
        <div className="courses-header">
          <h1 className="courses-title">My Courses</h1>
          <button className="add-course-button" onClick={() => setShowAddForm(true)}>
            <FaPlus className="add-icon" /> Add Course
          </button>
        </div>

        <div className="courses-search-div">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="courses-list">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course, index) => (
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
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  ) : (
                    <span className="home-course-name">{course.courseCode}</span>
                  )}
                </div>
                <FiMoreVertical
                  className="home-options-icon"
                  onClick={(e) => toggleMenu(index, e)}
                />
                {menuVisible === index && (
                  <div className="home-menu">
                    <button
                      className="home-menu-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCourseId(course.id);
                        setEditedCourseCode(course.courseCode);
                        setMenuVisible(null);
                      }}
                    >
                      <TiEdit className="rename-icon" /> Rename
                    </button>
                    <button 
                      className="home-menu-item" 
                      onClick={(e) => confirmDelete(course, e)}
                    >
                      <RiDeleteBin6Line className="delete-icon" /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No courses found. Add a course to get started.</p>
          )}
        </div>

        {showAddForm && (
          <div className="modal-background" onClick={closeModals}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-title">Add a Course</h3>
              <input
                className="modal-input"
                type="text"
                placeholder="Course Code"
                value={newCourse.courseCode}
                onChange={(e) => setNewCourse({ ...newCourse, courseCode: e.target.value })}
              />
              <input
                className="modal-input"
                type="text"
                placeholder="Professor Name"
                value={newCourse.professor}
                onChange={(e) => setNewCourse({ ...newCourse, professor: e.target.value })}
              />
              <div className="modal-buttons">
                <button className="modal-button confirm-button" onClick={handleAddCourse}>
                  Add Course
                </button>
                <button className="modal-button cancel-button" onClick={closeModals}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {attemptDelete && (
          <div className="modal-background" onClick={closeModals}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-title">Delete Course?</h3>
              <p className="modal-message">This action cannot be undone.</p>
              <div className="modal-buttons">
                <button 
                  className="modal-button confirm-button" 
                  onClick={handleDeleteCourse}
                >
                  Delete
                </button>
                <button 
                  className="modal-button cancel-button"
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

export default HomePage;