import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { createAssignment } from '../../api/assignments';
import { fetchCourseInfo, fetchCourseQuestions } from '../../api/courses';
import { FaChevronLeft, FaQuestion } from 'react-icons/fa';
import './CreateAssignmentPage.css';

function CreateAssignmentPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [courseName, setCourseName] = useState('');
  const [name, setName] = useState('');
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  useEffect(() => {
    const loadCourseName = async () => {
      try {
        const courseInfo = await fetchCourseInfo(courseId, navigate);
        if (courseInfo == null) {
          return;
        }
        setCourseName(courseInfo.courseCode.replace(/-/g, ' '));
      } catch (error) {
        alert('Failed to load course name');
        console.error(error);
      }
    };

    loadCourseName();
  }, [courseId, navigate]);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const questions = await fetchCourseQuestions(courseId, navigate);
        setAvailableQuestions(questions);
      } catch (error) {
        alert('Failed to load questions');
        console.error(error);
      }
    };

    loadQuestions();
  }, [courseId, navigate]);

  const handleAddToAssignment = (question) => {
    setAvailableQuestions(availableQuestions.filter((q) => q.id !== question.id));
    setSelectedQuestions([...selectedQuestions, question]);
  };

  const handleRemoveFromAssignment = (question) => {
    setSelectedQuestions(selectedQuestions.filter((q) => q.id !== question.id));
    setAvailableQuestions([...availableQuestions, question]);
  };

  const handleSaveAssignment = async () => {
    if (name.trim() === '') {
      alert('Please provide an assignment name');
      return;
    }

    if (selectedQuestions.length === 0) {
      alert('Please select at least one question for the assignment');
      return;
    }

    const assignmentData = {
      courseId: courseId,
      name: name.trim(),
      questionIds: selectedQuestions.map((q) => q.id),
    };

    try {
      await createAssignment(assignmentData, navigate);
      alert('Assignment created successfully');
      navigate(`/course/${courseId}`);
    } catch (error) {
      alert(error);
      console.error(error);
    }
  };

  const handleReturnToCourse = () => {
    navigate(`/course/${courseId}`);
  };

  return (
    <div className="create-assignment-page">
      <Header />
      <div className="create-assignment-content">
        {/* Updated header section */}
        <div className="create-assignment-header">
          <button className="back-button" onClick={handleReturnToCourse}>
            <FaChevronLeft />
          </button>
          <h2 className="create-assignment-title">Create Assignment for {courseName}</h2>
        </div>
        
        {/* Input field */}
        <div className="create-assignment-form-div">
          <input
            type="text"
            placeholder="Enter assignment name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="assignment-name-input"
          />
        </div>
        
        {/* Questions container */}
        <div className="questions-container">
          {/* Available questions section */}
          <div className="available-questions">
            <h3 className="questions-section-title">Available Questions</h3>
            <div className="question-div">
              {availableQuestions.length > 0 ? (
                <ul className="questions-list">
                  {availableQuestions.map((question) => (
                    <li key={question.id} className="question-item">
                      <span className="question-title">{question.title}</span>
                      <button 
                        className="question-button add-button"
                        onClick={() => handleAddToAssignment(question)}
                      >
                        Add
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-state-message">
                  Add questions to {courseName} before creating an assignment!
                </p>
              )}
            </div>
          </div>
          
          {/* Selected questions section */}
          <div className="selected-questions">
            <h3 className="questions-section-title">Selected Questions</h3>
            <div className="question-div">
              {selectedQuestions.length > 0 ? (
                <ul className="questions-list">
                  {selectedQuestions.map((question) => (
                    <li key={question.id} className="question-item">
                      <span className="question-title">{question.title}</span>
                      <button 
                        className="question-button remove-button"
                        onClick={() => handleRemoveFromAssignment(question)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-state-message">
                  No questions selected yet. Add some from the left panel.
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Save button */}
        <button className="save-assignment-button" onClick={handleSaveAssignment}>
          Save Assignment
        </button>
      </div>
    </div>
  );
}

export default CreateAssignmentPage;