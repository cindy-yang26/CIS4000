import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import { useNavigate } from 'react-router-dom';
import { createCourse, deleteCourse, fetchAllCourses } from '../../api/courses';
import './HomePage.css';
import { FaFolder, FaPlus } from 'react-icons/fa';
import { FiMoreVertical, FiTrash2 } from 'react-icons/fi';
import { TiEdit } from "react-icons/ti";


function HomePage() {
  const [courses, setCourses] = useState([]);
  const [menuVisible, setMenuVisible] = useState(null);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadCourses = async () => {
      const newCourseInfo = await fetchAllCourses();
      console.log(newCourseInfo);
      setCourses(newCourseInfo);
    };
    loadCourses();
  }, []);

  const handleCourseClick = (course) => {
    navigate(`/course/${course.id}`);
  };

  const handleDeleteCourse = (courseToDelete) => {
    const idToDelete = courseToDelete.id;
    deleteCourse(idToDelete);
    setCourses(courses.filter((course) => course.id !== idToDelete));
    setMenuVisible(null);
  };

  const toggleMenu = (index) => {
    if (menuVisible === index) {
      setMenuVisible(null);
    } else {
      setMenuVisible(index);
    }
  };

  const filteredCourses = courses.filter((course, index) => {
    // const title = course.courseCode || ''; 
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
          <button className="new-course-button">
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
            <div key={index} className="home-course-card" onClick={() => handleCourseClick(course)}>
              <div className="home-course-info">
                <FaFolder className="home-course-icon" />
                <span className="home-course-name">{course.courseCode}</span>
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
                  <button className="home-menu-item rename">
                    <TiEdit /> Rename
                  </button>
                  <button
                    className="home-menu-item delete"
                    onClick={() => handleDeleteCourse(course)}
                  >
                    <FiTrash2 /> Delete
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

export default HomePage;
