import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { FaChevronLeft, FaEdit, FaTrash } from 'react-icons/fa';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import './QuestionsPage.css';

function QuestionsPage() {
  const { courseName } = useParams();
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
  const [newQuestion, setNewQuestion] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newTags, setNewTags] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);

  const handleReturnToCourse = () => {
    navigate(`/course/${courseName}`);
  };

  const handleAddQuestion = () => {
    setShowForm(!showForm);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const tagsArray = newTags.split(',').map((tag) => tag.trim()).filter((tag) => tag);

    if (newQuestion.trim() && newTitle.trim()) {
      if (editingQuestion) {
        setQuestions(
          questions.map((q) =>
            q.id === editingQuestion.id
              ? { ...q, text: newQuestion, title: newTitle, comment: newComment, tags: tagsArray }
              : q
          )
        );
        setEditingQuestion(null);
      } else {
        setQuestions([
          ...questions,
          {
            id: questions.length + 1,
            title: newTitle,
            text: newQuestion,
            comment: newComment,
            tags: tagsArray,
            stats: { mean: 'N/A', median: 'N/A', stdDev: 'N/A', min: 'N/A', max: 'N/A' },
          },
        ]);
      }
      setNewQuestion('');
      setNewTitle('');
      setNewComment('');
      setNewTags('');
      setShowForm(false);
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setNewQuestion(question.text);
    setNewTitle(question.title);
    setNewComment(question.comment || '');
    setNewTags(question.tags.join(', '));
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
      <div className="questions-page">
        <Header />
        <div className="questions-content">
          <div className="questions-header">
            <button className="back-button" onClick={handleReturnToCourse}>
              <FaChevronLeft />
            </button>
            <h2 className="course-title">Questions for {courseName}</h2>
            <button className="add-question-button" onClick={handleAddQuestion}>
              {showForm ? 'Cancel' : editingQuestion ? 'Edit Question' : 'Add Question'}
            </button>
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
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <textarea
                placeholder="Enter your question"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                rows="3"
              />
              <textarea
                placeholder="Enter a comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows="2"
              />
              <input
                type="text"
                placeholder="Enter tags (comma-separated)"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
              />
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

export default QuestionsPage;
