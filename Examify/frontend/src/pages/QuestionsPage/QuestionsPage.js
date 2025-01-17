import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createQuestion, fetchQuestions, editQuestion, deleteQuestion } from '../../api/questions';
import Header from '../../components/Header/Header';
import { FaChevronLeft, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import './QuestionsPage.css';

function QuestionsPage() {
  const { courseName } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formFields, setFormFields] = useState({
    title: '',
    text: '',
    comment: '',
    tags: '',
    stats: { mean: '', median: '', stdDev: '', min: '', max: '' },
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const data = await fetchQuestions();
        setQuestions(data);
      } catch (error) {
        alert("Failed to fetch questions.");
        console.error(error);
      }
    };

    loadQuestions();
  }, []);

  const handleReturnToCourse = () => {
    navigate(`/course/${courseName}`);
  };

  const handleAddQuestion = () => {
    if (!showForm) {
      setFormFields({
        title: '',
        text: '',
        comment: '',
        tags: '',
        stats: { mean: '', median: '', stdDev: '', min: '', max: '' },
      });
    }
    setShowForm(!showForm);
    setEditingQuestion(null);
  };

  const handleCancelQuestion = () => {
    setShowForm(!showForm);
    setEditingQuestion(null);
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();
  
    const tagsArray = formFields.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag);
  
    const questionData = {
      title: formFields.title,
      text: formFields.text,
      comment: formFields.comment,
      tags: tagsArray,
      stats: { ...formFields.stats },
    };
  
    try {
      if (editingQuestion) {
        await editQuestion(editingQuestion.id, questionData);
        const updatedQuestions = await fetchQuestions();
        setQuestions(updatedQuestions);
      } else {
        await createQuestion(questionData);
        const updatedQuestions = await fetchQuestions();
        setQuestions(updatedQuestions);
      }
  
      setFormFields({
        title: '',
        text: '',
        comment: '',
        tags: '',
        stats: { mean: '', median: '', stdDev: '', min: '', max: '' },
      });
      setShowForm(false);
    } catch (error) {
      alert("Failed to save question");
      console.error(error);
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

  const handleDeleteQuestion = async (id) => {
    try {
      await deleteQuestion(id);
      const updatedQuestions = await fetchQuestions();
      setQuestions(updatedQuestions);
    } catch (error) {
      alert(error);
      console.error(error);
    }
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

  const filteredQuestions = questions.filter((question) => {
    const title = question.title || ''; 
    const text = question.text || '';   
    const tags = question.tags || [];  
  
    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tags.some((tag) => (tag || '').toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });
  

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
              <FaPlus />
              <span className="question-button-text">{editingQuestion ? 'Edit Question' : ' Add Question'}</span>
            </button>
          </div>

          <div className="question-search-div">
            <input
              type="text"
              placeholder=" 🔍 Search questions by title, tags, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="question-search-input"
            />
          </div>

          <ul className="questions-list">
            {filteredQuestions.map((question) => (
              <li key={question.id} className="question-item">
                <div className="question-text">
                  <h3 className="question-title">{question.title}</h3>
                  <div className="question-tags">
                  {(question.tags || []).map((tag, index) => (
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
                    Mean: {question.stats?.mean || 'N/A'}, 
                    Median: {question.stats?.median || 'N/A'}, 
                    Std Dev: {question.stats?.stdDev || 'N/A'}, 
                    Min: {question.stats?.min || 'N/A'}, 
                    Max: {question.stats?.max || 'N/A'}
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
            <div className="question-form-div">
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
                <button className="cancel-question-button" onClick={handleCancelQuestion}>
                  Cancel
                </button>

              </form>
            </div>
          )}
        </div>
      </div>
    </MathJaxContext>
  );
}

export default QuestionsPage;
