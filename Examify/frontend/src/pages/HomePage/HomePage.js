import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import { useNavigate } from 'react-router-dom';
import { createCourse } from '../../api/courses';
import './HomePage.css';
import { FaFolder, FaPlus } from 'react-icons/fa';
import { FiMoreVertical, FiTrash2 } from 'react-icons/fi';
import { TiEdit } from "react-icons/ti";


function HomePage() {
  const [courses, setCourses] = useState(['Math 220', 'Math 221', 'CIS 222', 'EAS 223']);
  const [menuVisible, setMenuVisible] = useState(null); 
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredCourses = courses.filter((course, index) => {
    // const title = course.title || ''; 
    const title = course;
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
                <span className="home-course-name">{course}</span>
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
