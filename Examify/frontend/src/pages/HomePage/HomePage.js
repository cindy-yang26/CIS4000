import React from 'react';
import Header from '../../components/Header/Header';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import { FaFolder, FaEllipsisH, FaPlus } from 'react-icons/fa';

function HomePage() {
  const courses = ['Math 220', 'Math 221', 'Math 222', 'Math 223'];
  const navigate = useNavigate();

  const handleCourseClick = () => {
    navigate('/course');
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
            <div key={index} className="course-card" onClick={handleCourseClick}>
              <FaFolder className="course-icon" />
              <span className="course-name">{course}</span>
              <FaEllipsisH className="options-icon" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;