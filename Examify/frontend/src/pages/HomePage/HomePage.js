import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import { FaFolder, FaEllipsisH, FaPlus } from 'react-icons/fa';

function HomePage() {
  const [courses, setCourses] = useState(['Math 220', 'Math 221', 'Math 222', 'Math 223']);
  const [menuVisible, setMenuVisible] = useState(null); 
  const navigate = useNavigate();

  const handleCourseClick = (courseName) => {
    const slug = courseName.replace(/\s+/g, '-');
    navigate(`/course/${slug}`);
  };

  const handleDeleteCourse = (courseToDelete) => {
    setCourses(courses.filter((course) => course !== courseToDelete));
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
    <div className="home-page">
      <Header />
      <div className="home-content">
        <div className="courses-header">
          <h2>My Courses</h2>
          <button className="new-course-button">
            <FaPlus /> New
          </button>
        </div>
        <div className="courses-list">
          {courses.map((course, index) => (
            <div key={index} className="course-card">
              <div
                className="course-info"
                onClick={() => handleCourseClick(course)}
              >
                <FaFolder className="course-icon" />
                <span className="course-name">{course}</span>
              </div>
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
                    onClick={() => handleDeleteCourse(course)}
                  >
                    Delete Course
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
