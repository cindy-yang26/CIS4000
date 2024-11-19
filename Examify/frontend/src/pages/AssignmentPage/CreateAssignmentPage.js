import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import './CreateAssignmentPage.css';

function CreateAssignmentPage() {
  const { courseName } = useParams();
  const navigate = useNavigate();

  const [assignmentName, setAssignmentName] = useState('');
  const [availableQuestions, setAvailableQuestions] = useState([
    { id: 1, title: 'Derivative Question', text: 'What is the derivative of \\(x^2\\)?' },
    { id: 2, title: 'Integral Question', text: 'Solve the integral of \\(\\sin(x)\\).' },
    { id: 3, title: 'Physics Question', text: 'Explain Newton’s laws of motion.' },
  ]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const handleAddToAssignment = (question) => {
    setAvailableQuestions(availableQuestions.filter((q) => q.id !== question.id));
    setSelectedQuestions([...selectedQuestions, question]);
  };

  const handleRemoveFromAssignment = (question) => {
    setSelectedQuestions(selectedQuestions.filter((q) => q.id !== question.id));
    setAvailableQuestions([...availableQuestions, question]);
  };

  const handleSaveAssignment = () => {
    if (assignmentName.trim() === '') {
      alert('Please provide an assignment name');
      return;
    }

    const newAssignment = {
      name: assignmentName,
      questions: selectedQuestions,
    };

    navigate(`/course/${courseName}`);
  };

  return (
    <div className="create-assignment-page">
      <Header />
      <div className="create-assignment-content">
        <h2>Create Assignment for {courseName}</h2>
        <input
          type="text"
          placeholder="Enter Assignment Name"
          value={assignmentName}
          onChange={(e) => setAssignmentName(e.target.value)}
          className="assignment-name-input"
        />
        <div className="questions-container">
          <div className="available-questions">
            <h3>Available Questions</h3>
            <ul>
              {availableQuestions.map((question) => (
                <li key={question.id}>
                  <span>{question.title}</span>
                  <button onClick={() => handleAddToAssignment(question)}>Add</button>
                </li>
              ))}
            </ul>
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
