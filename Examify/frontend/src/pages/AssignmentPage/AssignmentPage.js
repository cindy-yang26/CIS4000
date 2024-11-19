import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { FaChevronLeft } from 'react-icons/fa';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import './AssignmentPage.css';

function AssignmentPage() {
  const { courseName, assignmentName } = useParams();
  const navigate = useNavigate();

  const questions = [
    {
      id: 1,
      title: 'Derivative Question',
      text: 'What is the derivative of \\(x^2\\)?',
      stats: { mean: 'N/A', median: 'N/A', stdDev: 'N/A', min: 'N/A', max: 'N/A' },
      comment: 'This question focuses on basic differentiation.',
      tags: ['Single Variable Differentiation', 'Derivative'],
    },
    {
      id: 2,
      title: 'Integral Question',
      text: 'Solve the integral of \\(\\sin(x)\\).',
      stats: { mean: 'N/A', median: 'N/A', stdDev: 'N/A', min: 'N/A', max: 'N/A' },
      comment: 'This question covers trigonometric integrals.',
      tags: ['Trigonometry', 'Integral'],
    },
    {
      id: 3,
      title: 'Physics Question',
      text: 'Explain Newton’s laws of motion.',
      stats: { mean: 'N/A', median: 'N/A', stdDev: 'N/A', min: 'N/A', max: 'N/A' },
      comment: 'This question focuses on basic physics concepts.',
      tags: ['Physics', 'Newton’s Laws'],
    },
  ];

  const handleReturnToCourse = () => {
    navigate(`/course/${courseName}`);
  };

  return (
    <MathJaxContext>
      <div className="assignment-page">
        <Header />
        <div className="assignment-content">
          <div className="assignment-header">
            <button className="back-button" onClick={handleReturnToCourse}>
              <FaChevronLeft />
            </button>
            <h2 className="assignment-title">
              {assignmentName} - Questions for {courseName}
            </h2>
          </div>
          <ul className="questions-list">
            {questions.map((question) => (
              <li key={question.id} className="question-item">
                <div className="question-text">
                  <h3>{question.title}</h3>
                  <div className="question-tags">
                    {question.tags.map((tag, index) => (
                      <span key={index} className="tag-item">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <MathJax>{question.text}</MathJax>
                  <div className="question-stats">
                    <strong>Stats:</strong> Mean: {question.stats.mean}, Median: {question.stats.median}, Std Dev: {question.stats.stdDev}, Min: {question.stats.min}, Max: {question.stats.max}
                  </div>
                  {question.comment && (
                    <div className="question-comment">
                      <strong>Comment:</strong> {question.comment}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </MathJaxContext>
  );
}

export default AssignmentPage;
