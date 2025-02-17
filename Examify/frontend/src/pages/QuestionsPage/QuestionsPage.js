import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCourseInfo, fetchCourseQuestions } from '../../api/courses';
import { createQuestion, editQuestion, deleteQuestion, uploadFileContentToBackend } from '../../api/questions';
import Header from '../../components/Header/Header';
import { FaChevronLeft, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import './QuestionsPage.css';
import mammoth from 'mammoth';

function QuestionsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [courseName, setCourseName] = useState("");
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formFields, setFormFields] = useState({
    title: '',
    text: '',
    comment: '',
    tags: '',
    questionType: 'essay_question',
    stats: { mean: '', median: '', stdDev: '', min: '', max: '' },
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadCourseName = async () => {
      try {
        const courseInfo = await fetchCourseInfo(courseId, navigate);
        if (courseInfo == null) {
          return;
        }
        setCourseName(courseInfo.courseCode);
      } catch (error) {
        alert('Failed to load course name.');
        console.error(error);
      }
    };

    loadCourseName();
  }, [courseId]);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const data = await fetchCourseQuestions(courseId, navigate);
        setQuestions(data);
      } catch (error) {
        alert("Failed to fetch questions.");
        console.error(error);
      }
    };

    loadQuestions();
  }, [courseId]);

  const handleReturnToCourse = () => {
    navigate(`/course/${courseId}`);
  };

  const handleAddQuestion = () => {
    if (!showForm) {
      setFormFields({
        title: '',
        text: '',
        comment: '',
        tags: '',
        questionType: 'essay_question',
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

  const formatQuestionType = (questionType) => {
    const typeMap = {
      "multiple_choice_question": "MCQ",
      "essay_question": "Long Response",
      "true_false_question": "True/False",
      "numerical_question": "Numerical",
    };
    
    return typeMap[questionType] || "Long Response"; 
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
  
    const tagsArray = formFields.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag);
    let optionsArray = formFields.options ? formFields.options.split(',').map(opt => opt.trim()) : [];


    if (!formFields.title.trim()) {
      alert("Title cannot be empty.");
      return;
    }
  
    if (formFields.questionType === "multiple_choice_question") {
      if (!formFields.options || formFields.options.split(',').length < 2) {
        alert("Multiple Choice Questions must have at least 2 options.");
        return;
      }
      if (!formFields.correctAnswer.trim()) {
        alert("MCQs must have a correct answer.");
        return;
      }
      if (!optionsArray.includes(formFields.correctAnswer.trim())) {
        alert("Correct answer must be one of the provided answer choices.");
        return;
      }
    }
  
    if (formFields.questionType === "true_false_question" && !formFields.correctAnswer) {
      alert("True/False questions must have a correct answer.");
      return;
    }
  
    if (formFields.questionType === "numerical_question" && (formFields.correctAnswer === "" || isNaN(formFields.correctAnswer))) {
      alert("Numerical questions must have a valid numerical answer.");
      return;
    }
  
    const questionData = {
      courseId: courseId,
      title: formFields.title,
      text: formFields.text,
      comment: formFields.comment,
      tags: tagsArray,
      questionType: formFields.questionType,
      stats: { ...formFields.stats },
      options: formFields.options ? formFields.options.split(',').map(opt => opt.trim()) : [],
      correctAnswer: formFields.questionType === "true_false_question"
      ? (formFields.correctAnswer === "False" ? "False" : "True")
      : formFields.correctAnswer || "",
    };
  
    try {
      if (editingQuestion) {
        await editQuestion(editingQuestion.id, questionData, navigate);
      } else {
        await createQuestion(questionData, navigate);
      }
  
      const updatedQuestions = await fetchCourseQuestions(courseId, navigate);
      setQuestions(updatedQuestions);
  
      setFormFields({
        title: '',
        text: '',
        comment: '',
        tags: '',
        questionType: 'essay_question',
        stats: { mean: '', median: '', stdDev: '', min: '', max: '' },
        options: '',
        correctAnswer: ''
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
      questionType: question.questionType || 'essay_question',
      stats: { ...question.stats },
      options: Array.isArray(question.options) ? question.options.join(', ') : '',
      correctAnswer: question.questionType === "true_false_question"
      ? (question.correctAnswer === "True" || question.correctAnswer === "False"
        ? question.correctAnswer
        : "True")
      : question.correctAnswer || '',
    });
    setShowForm(true);
  };
  

  const handleDeleteQuestion = async (id) => {
    try {
      await deleteQuestion(id, navigate);
      const updatedQuestions = await fetchCourseQuestions(courseId, navigate);
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

  const handleUploadDocument = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      alert('No file selected!');
      return;
    }

    const fileType = file.name.split('.').pop().toLowerCase();

    if (fileType === 'docx') {
      const reader = new FileReader();

      reader.onload = async (event) => {
        const arrayBuffer = event.target.result;
        try {
          const result = await mammoth.extractRawText({ arrayBuffer });
          const fileContent = result.value;
          await uploadFileContentToBackend(courseId, fileContent, navigate);
          const updatedQuestions = await fetchCourseQuestions(courseId, navigate);
          setQuestions(updatedQuestions);
        } catch (error) {
          console.error('Error processing Word document:', error);
          alert('Failed to process the Word document.');
        }
      };

      reader.readAsArrayBuffer(file);
    } else if (fileType === 'txt') {
      const reader = new FileReader();

      reader.onload = async (event) => {
        const fileContent = event.target.result;
        await uploadFileContentToBackend(courseId, fileContent, navigate);
        const updatedQuestions = await fetchCourseQuestions(courseId, navigate);
        setQuestions(updatedQuestions);
      };

      reader.readAsText(file);
    } else {
      alert('Unsupported file type. Please upload a .docx or .txt file.');
    }
  };


  return (
    <MathJaxContext>
      <div className="questions-page">
        <Header />
        <div className="questions-content">
          <div className="questions-header">
            <div className="questions-subheader">
              <button className="questions-back-button" onClick={handleReturnToCourse}>
                <FaChevronLeft />
              </button>
              <h2 className="course-title">Questions for {courseName}</h2>
            </div>
            <div className="button-container">
              <button className="add-question-button" onClick={handleAddQuestion}>
                <FaPlus />
                <span className="question-button-text">{editingQuestion ? 'Edit Question' : ' Add Question'}</span>
              </button>
              <button className="upload-document-button">
                <label htmlFor="upload-document" style={{ cursor: "pointer" }}>
                  Upload Document
                </label>
                <input
                  type="file"
                  id="upload-document"
                  style={{ display: "none" }}
                  accept=".txt"
                  onChange={handleUploadDocument}
                />
              </button>
            </div>
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
                  <h4 className="question-type-display">{formatQuestionType(question.questionType)}</h4> 
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
                  
                  {question.questionType === "multiple_choice_question" && (
                    <p><strong>Choices:</strong> {Array.isArray(question.options) ? question.options.join(', ') : 'No options provided'}</p>
                  )}

                  {question.correctAnswer && (
                    <p><strong>Correct Answer:</strong> {question.correctAnswer}</p>
                  )}

                  
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
                  <button className="edit-button" onClick={() => handleEditQuestion(question)}>
                    <FaEdit />
                  </button>
                  <button className="delete-button" onClick={() => handleDeleteQuestion(question.id)}>
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
                <div className="question-type-container">
                  <label htmlFor="questionType">Question Type:</label>
                  <select 
                    id="questionType"
                    className="question-type-selector"
                    value={formFields.questionType}
                    onChange={(e) => setFormFields({ ...formFields, questionType: e.target.value })}
                  >
                    <option value="multiple_choice_question">Multiple Choice</option>
                    <option value="essay_question">Long Response</option>
                    <option value="true_false_question">True/False</option>
                    <option value="numerical_question">Numerical</option>
                  </select>
              </div>

              <label>Question:</label>
              <textarea
                placeholder="Enter your question"
                value={formFields.text}
                onChange={(e) => setFormFields({ ...formFields, text: e.target.value })}
                rows="3"
              />

            {formFields.questionType === "essay_question" && (
                  <div>
                    <label>Correct Answer:</label>
                    <input
                      type="text"
                      placeholder="Enter correct answer"
                      value={formFields.correctAnswer || ''}
                      onChange={(e) => setFormFields({ ...formFields, correctAnswer: e.target.value })}
                    />
                  </div>
                )}

              {formFields.questionType === "multiple_choice_question" && (
                  <div className="mcq-options">
                    <label>Answer Choices (comma-separated):</label>
                    <input
                      type="text"
                      placeholder="Option1, Option2, Option3, ..."
                      value={formFields.options || ''}
                      onChange={(e) => setFormFields({ ...formFields, options: e.target.value })}
                    />
                    <label>Correct Answer:</label>
                    <input
                      type="text"
                      placeholder="Enter correct answer"
                      value={formFields.correctAnswer || ''}
                      onChange={(e) => setFormFields({ ...formFields, correctAnswer: e.target.value })}
                    />
                  </div>
                )}

                {formFields.questionType === "true_false_question" && (
                  <div className="tf-options">
                    <label>Correct Answer:</label>
                    <select
                      value={formFields.correctAnswer || 'True'}
                      onChange={(e) => setFormFields({ ...formFields, correctAnswer: e.target.value })}
                    >
                      <option value="True">True</option>
                      <option value="False">False</option>
                    </select>
                  </div>
                )}

                {formFields.questionType === "numerical_question" && (
                  <div className="numerical-answer">
                    <label>Correct Answer:</label>
                    <input
                      type="number"
                      placeholder="Enter correct numerical value"
                      value={formFields.correctAnswer || ''}
                      onChange={(e) => setFormFields({ ...formFields, correctAnswer: e.target.value })}
                    />
                  </div>
                )} 

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
