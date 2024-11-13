import React from 'react';
import Header from '../../components/Header/Header';
import { FaEllipsisH, FaPlus } from 'react-icons/fa';
import './CoursePage.css';

function CoursePage() {
  const assignments = ['Spring 2021 MT2', 'Fall 2020 MT1', 'Spring 2022 Final']; 
  const courseName = 'Math 220'; 

  return (
    <div className="course-page">
      <Header />
      <div className="course-content">
        <div className="course-header">
          <h2 className="course-name">{courseName}</h2>
          <button className="add-assignment-button">
            <FaPlus /> Add Assignment
          </button>
        </div>
        <h3>Assignments</h3>
        <div className="assignments-list">
          {assignments.map((assignment, index) => (
            <div key={index} className="assignment-card">
              <span className="assignment-name">{assignment}</span>
              <FaEllipsisH className="options-icon" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CoursePage;
