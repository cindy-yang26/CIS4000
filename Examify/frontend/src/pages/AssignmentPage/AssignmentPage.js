import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { FaChevronLeft, FaEdit, FaTrash } from 'react-icons/fa';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import './AssignmentPage.css';

function AssignmentPage() {
  const { courseName, assignmentName } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([
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
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formFields, setFormFields] = useState({
    title: '',
    text: '',
    comment: '',
    tags: '',
    stats: { mean: '', median: '', stdDev: '', min: '', max: '' },
  });
  const [editingQuestion, setEditingQuestion] = useState(null);

  const handleReturnToCourse = () => {
    navigate(`/course/${courseName}`);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const tagsArray = formFields.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag);

    if (formFields.text.trim() && formFields.title.trim()) {
      if (editingQuestion) {
        setQuestions(
          questions.map((q) =>
            q.id === editingQuestion.id
              ? {
                  ...q,
                  title: formFields.title,
                  text: formFields.text,
                  comment: formFields.comment,
                  tags: tagsArray,
                  stats: { ...formFields.stats },
                }
              : q
          )
        );
        setEditingQuestion(null);
      } else {
        setQuestions([
          ...questions,
          {
            id: questions.length + 1,
            title: formFields.title,
            text: formFields.text,
            comment: formFields.comment,
            tags: tagsArray,
            stats: { ...formFields.stats },
          },
        ]);
      }

      setFormFields({
        title: '',
        text: '',
        comment: '',
        tags: '',
        stats: { mean: '', median: '', stdDev: '', min: '', max: '' },
      });
      setShowForm(false);
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setFormFields({
      title: question.title,
      text: question.text,
      comment: question.comment || '',
      tags: question.tags.join(', '),
      stats: { ...question.stats },
    });
    setShowForm(true);
  };

  const handleDeleteQuestion = (id) => {
    setQuestions(questions.filter((question) => question.id !== id));
  };

  const handleDeleteTag = (questionId, tagToDelete) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? { ...q, tags: q.tags.filter((tag) => tag !== tagToDelete) }
          : q
      )
    );
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
              {assignmentName.replace(/-/g, ' ')} (Course: {courseName.replace(/-/g, ' ')})
            </h2>
          </div>

          <ul className="questions-list">
            {questions.map((question) => (
              <li key={question.id} className="question-item">
                <div className="question-text">
                  <h3 className="question-title">{question.title}</h3>
                  <div className="question-tags">
                    {question.tags.map((tag, index) => (
                      <span key={index} className="tag-item">
                        {tag}
                        <button
                          className="delete-tag-button"
                          onClick={() => handleDeleteTag(question.id, tag)}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                  <MathJax>{question.text}</MathJax>
                  <div className="question-stats">
                    Mean: {question.stats.mean}, Median: {question.stats.median}, Std Dev: {question.stats.stdDev}, Min: {question.stats.min}, Max: {question.stats.max}
                  </div>
                  {question.comment && (
                    <div className="question-comment">
                      <strong>Comment:</strong> {question.comment}
                    </div>
                  )}
                </div>
                <div className="question-actions">
                  <button
                    className="edit-button"
                    onClick={() => handleEditQuestion(question)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteQuestion(question.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {showForm && (
            <form className="add-question-form" onSubmit={handleFormSubmit}>
              <input
                type="text"
                placeholder="Enter question title"
                value={formFields.title}
                onChange={(e) =>
                  setFormFields({ ...formFields, title: e.target.value })
                }
              />
              <textarea
                placeholder="Enter your question"
                value={formFields.text}
                onChange={(e) =>
                  setFormFields({ ...formFields, text: e.target.value })
                }
                rows="3"
              />
              <textarea
                placeholder="Enter a comment"
                value={formFields.comment}
                onChange={(e) =>
                  setFormFields({ ...formFields, comment: e.target.value })
                }
                rows="2"
              />
              <input
                type="text"
                placeholder="Enter tags (comma-separated)"
                value={formFields.tags}
                onChange={(e) =>
                  setFormFields({ ...formFields, tags: e.target.value })
                }
              />
              <div className="stats-fields">
                <label>
                  Mean:
                  <input
                    type="text"
                    value={formFields.stats.mean}
                    onChange={(e) =>
                      setFormFields({ ...formFields, stats: { ...formFields.stats, mean: e.target.value } })
                    }
                  />
                </label>
                <label>
                  Median:
                  <input
                    type="text"
                    value={formFields.stats.median}
                    onChange={(e) =>
                      setFormFields({ ...formFields, stats: { ...formFields.stats, median: e.target.value } })
                    }
                  />
                </label>
                <label>
                  Std Dev:
                  <input
                    type="text"
                    value={formFields.stats.stdDev}
                    onChange={(e) =>
                      setFormFields({ ...formFields, stats: { ...formFields.stats, stdDev: e.target.value } })
                    }
                  />
                </label>
                <label>
                  Min:
                  <input
                    type="text"
                    value={formFields.stats.min}
                    onChange={(e) =>
                      setFormFields({ ...formFields, stats: { ...formFields.stats, min: e.target.value } })
                    }
                  />
                </label>
                <label>
                  Max:
                  <input
                    type="text"
                    value={formFields.stats.max}
                    onChange={(e) =>
                      setFormFields({ ...formFields, stats: { ...formFields.stats, max: e.target.value } })
                    }
                  />
                </label>
              </div>

              <button type="submit" className="submit-question-button">
                {editingQuestion ? 'Save Changes' : 'Add Question'}
              </button>
            </form>
          )}
        </div>
      </div>
    </MathJaxContext>
  );
}

export default AssignmentPage;
