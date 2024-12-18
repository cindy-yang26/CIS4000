import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { createAssignment } from '../../api/assignments';
import { fetchQuestions } from '../../api/questions';
import './CreateAssignmentPage.css';

function CreateAssignmentPage() {
  const { courseName } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const questions = await fetchQuestions(); 
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
      name: name,
      questionIds: selectedQuestions.map((q) => q.id),
    };

    try {
      await createAssignment(assignmentData);
      alert('Assignment created successfully');
      navigate(`/course/${courseName}`);
    } catch (error) {
      alert(error);
      console.error(error);
    }
  };

  return (
    <div className="create-assignment-page">
      <Header />
      <div className="create-assignment-content">
        <h2>Create Assignment for {courseName}</h2>
        <input
          type="text"
          placeholder="Enter Assignment Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
