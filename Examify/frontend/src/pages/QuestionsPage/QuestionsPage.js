import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { FaChevronLeft } from 'react-icons/fa';
import './QuestionsPage.css';

function QuestionsPage() {
  const { courseName } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([
    { id: 1, text: 'What is the derivative of x^2?' },
    { id: 2, text: 'Solve the integral of sin(x).' },
    { id: 3, text: 'Explain Newton’s laws of motion.' },
    { id: 4, text: 'What is the capital of France?' },
  ]); 

  const [showForm, setShowForm] = useState(false); 
  const [newQuestion, setNewQuestion] = useState('');

  const handleReturnToCourse = () => {
    navigate(`/course/${courseName}`);
  };

  const handleAddQuestion = () => {
    setShowForm(!showForm);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (newQuestion.trim()) {
      setQuestions([
        ...questions,
        { id: questions.length + 1, text: newQuestion },
      ]);
      setNewQuestion(''); 
      setShowForm(false); 
    }
  };

  return (
    <div className="questions-page">
      <Header />
      <div className="questions-content">
        <div className="questions-header">
          <button className="back-button" onClick={handleReturnToCourse}>
            <FaChevronLeft />
          </button>
          <h2 className="course-title">Questions for {courseName}</h2>
          <button className="add-question-button" onClick={handleAddQuestion}>
            {showForm ? 'Cancel' : 'Add Question'}
          </button>
        </div>

        <ul className="questions-list">
          {questions.map((question) => (
            <li key={question.id} className="question-item">
              {question.text}
            </li>
          ))}
        </ul>

        {showForm && (
          <form className="add-question-form" onSubmit={handleFormSubmit}>
            <textarea
              placeholder="Enter your question"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              rows="3"
            />
            <button type="submit" className="submit-question-button">
              Add Question
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default QuestionsPage;
