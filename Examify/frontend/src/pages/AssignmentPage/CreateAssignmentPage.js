import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { createAssignment } from '../../api/assignments';
import { fetchCourseInfo, fetchCourseQuestions } from '../../api/courses';
import { FaChevronLeft } from 'react-icons/fa';
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
        setCourseName(courseInfo.courseCode);
      } catch (error) {
        alert('Failed to load course name');
        console.error(error);
      }
    };

    loadCourseName();
  }, [courseId]);

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
  }, []);

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
        <div className="create-assignment-header">
          <button className="back-button" onClick={handleReturnToCourse}>
            <FaChevronLeft />
          </button>
          <h2>Create Assignment for {courseName}</h2>
        </div>
        <div className="create-assignment-form-div">
        <input
          type="text"
          placeholder="Enter Assignment Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="assignment-name-input"
        />
        </div>
        <div className="questions-container">
          <div className="available-questions">
            <h3>Available Questions</h3>
            <div className="question-div">
              <ul>
                {availableQuestions.length > 0 ? (availableQuestions.map((question) => (
                  <li key={question.id}>
                    <span>{question.title}</span>
                    <button onClick={() => handleAddToAssignment(question)}>Add</button>
                  </li>
                ))) : (
                  <p>Add questions to {courseName} before creating an assignment!</p>
                )}
              </ul>
            </div>
          </div>
          <div className="selected-questions">
            <h3>Selected Questions</h3>
            <ul>
              {selectedQuestions.map((question) => (
                <li key={question.id}>
                  <span>{question.title}</span>
                  <button onClick={() => handleRemoveFromAssignment(question)}>Remove</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <button className="save-assignment-button" onClick={handleSaveAssignment}>
          Save Assignment
        </button>
      </div>
    </div>
  );
}

export default CreateAssignmentPage;
