import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCourseInfo, fetchCourseQuestions, getAllTags } from '../../api/courses';
import { createQuestion, editQuestion, deleteQuestion, uploadFileContentToBackend } from '../../api/questions';
import Header from '../../components/Header/Header';
import { FaChevronLeft, FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import { fetchQuestionVariants, createQuestionVariant } from "../../api/variants";
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
  const [attemptDelete, setAttemptDelete] = useState(false)
  const [tags, setTags] = useState([])
  const [filteredTags, setFilteredTags] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [variants, setVariants] = useState({});
  const [loadingVariants, setLoadingVariants] = useState({});

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


  useEffect(() => {
    const loadTags = async () => {
      try {
        const tagSet = await getAllTags(courseId, navigate);
        if (tagSet == null) {
          return;
        }
        console.log(tagSet);
        setTags(tagSet);
      } catch (error) {
        alert('Failed to load tags.');
        console.error(error);
      }
    };
    loadTags();
  }, [showForm]);


  const handleTagSearch = (input) => {
    if (!input.trim()) {
      setFilteredTags(tags);
      return;
    }
  
    const inputTags = input.split(',').map(tag => tag.trim());
    const lastTag = inputTags[inputTags.length - 1];
  
    const matchingTags = tags.filter(tag =>
      tag.toLowerCase().includes(lastTag.toLowerCase())
    );
  
    setFilteredTags(matchingTags);
  };
  

  const handleTagSelect = (selectedTag) => {
    const currentTags = formFields.tags.split(',').map(tag => tag.trim());
    
    if (!currentTags.includes(selectedTag)) {
      currentTags[currentTags.length - 1] = selectedTag;
      setFormFields({ ...formFields, tags: currentTags.join(', ') });
    }
    
    setShowSuggestions(false);
  };

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
        if (editingQuestion.originalQuestionId) {
          const updatedVariants = await fetchQuestionVariants(editingQuestion.originalQuestionId);
          setVariants((prev) => ({
            ...prev,
            [editingQuestion.originalQuestionId]: updatedVariants,
          }));
        } else {
          const updatedQuestions = await fetchCourseQuestions(courseId, navigate);
          setQuestions(updatedQuestions);
        }
      } else {
        await createQuestion(questionData, navigate);
      }
  
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

  const handleEditQuestion = (question, originalQuestionId = null) => {
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
  

  const handleDeleteQuestion = async (id, originalQuestionId = null) => {
    try {
      await deleteQuestion(id, navigate);
      if (originalQuestionId) {
        setVariants((prev) => ({
          ...prev,
          [originalQuestionId]: prev[originalQuestionId].filter((variant) => variant.id !== id),
        }));
      } else {
        const updatedQuestions = await fetchCourseQuestions(courseId, navigate);
        setQuestions(updatedQuestions);
      }
      setAttemptDelete(false);
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

  const handleViewVariants = async (questionId) => {
    if (expandedQuestion === questionId) {
      setExpandedQuestion(null);
      return;
    }

    setExpandedQuestion(questionId);
    setLoadingVariants((prev) => ({ ...prev, [questionId]: true }));

    try {
      const data = await fetchQuestionVariants(questionId);
      setVariants((prev) => ({ ...prev, [questionId]: data }));
    } catch (error) {
      alert("Failed to load question variants.");
      console.error(error);
    }

    setLoadingVariants((prev) => ({ ...prev, [questionId]: false }));
  };

  const handleCreateVariant = async (question) => {
    try {
      await createQuestionVariant(question.id);
      alert("Variant created successfully!");
      handleViewVariants(question.id); 
    } catch (error) {
      alert("Error creating variant.");
      console.error(error);
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
                  <div className="question-header">
                    <h3 className="question-title">{question.title}</h3> 
                    <div className="variant-controls">
                      <button className="view-variants-button" onClick={() => handleViewVariants(question.id)}>
                        <FaEye /> {expandedQuestion === question.id ? "Hide Variants" : "View Variants"}
                      </button>
                      <button className="create-variant-button" onClick={() => handleCreateVariant(question)}>
                        <FaPlus /> Create Variant
                      </button>
                    </div>
                  </div>
                  <h4 className="question-type-display">{formatQuestionType(question.questionType)}</h4> 
                  {question.tags && question.tags.length > 0 && (
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
                    )}
                  
                  <MathJax>{question.text}</MathJax>
                  
                  {question.questionType === "multiple_choice_question" && (
                  <div style={{marginTop: '5px'}}>
                    <strong>Choices:</strong>
                    <ul style={{ marginTop: "5px", paddingLeft: "0px", listStyleType: "none" }}>
                      {Array.isArray(question.options) && question.options.length > 0
                        ? question.options.map((choice, index) => (
                            <li 
                              key={index} 
                              style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: 'flex-start' }}
                            >
                              <strong>{String.fromCharCode(65 + index)})</strong>
                              <span>{choice}</span>
                            </li>
                          ))
                        : <li>No options provided</li>}
                    </ul>
                  </div>
                )}

                  {question.correctAnswer && (
                    <p><strong>Correct Answer:</strong> {question.correctAnswer}</p>
                  )}

{expandedQuestion === question.id && (
  <div className="variants-list">
    {loadingVariants[question.id] ? (
      <p>Loading variants...</p>
    ) : variants[question.id]?.length > 0 ? (
      variants[question.id].map((variant) => (
        <div key={variant.id} className="variant-item">
          <h4>Variant:</h4>
          <MathJax>{variant.text}</MathJax>

          {/* Show Answer Choices if MCQ */}
          {variant.questionType === "multiple_choice_question" && variant.options?.length > 0 && (
            <div style={{ marginTop: '5px' }}>
              <strong>Choices:</strong>
              <ul style={{ marginTop: "5px", paddingLeft: "0px", listStyleType: "none" }}>
                {variant.options.map((choice, index) => (
                  <li key={index} style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: 'flex-start' }}>
                    <strong>{String.fromCharCode(65 + index)})</strong>
                    <span>{choice}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Correct Answer */}
          {variant.correctAnswer && (
            <p><strong>Correct Answer:</strong> {variant.correctAnswer}</p>
          )}

          {/* Edit & Delete Buttons */}
          <div className="variant-actions">
            <button className="edit-button" onClick={() => handleEditQuestion(variant)}>
              <FaEdit />
            </button>
            <button className="delete-button" onClick={() => handleDeleteQuestion(variant.id, question.id)}>
              <FaTrash />
            </button>
          </div>
        </div>
      ))
    ) : (
      <p>No variants available.</p>
    )}
  </div>
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
                  <button
                    className="delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAttemptDelete(true)}
                    }>
                    <FaTrash />
                  </button>
                </div>
                {attemptDelete && (
                <div className="modal-background">
                  <div className="delete-confirmation-window">
                    <h3 id="link-canvas-title">Delete Question?</h3>
                    <p>This action can not be undone</p>
                    <div className="window-button-div">
                      <button 
                        className="link-canvas-window-button" id="add-course-button" 
                        onClick={(e) => {
                          handleDeleteQuestion(question.id)
                        }}
                      >
                        Delete
                      </button>
                      <button 
                        className="link-canvas-window-button" id="add-course-cancel"
                        onClick={(e) => {
                          setAttemptDelete(false)
                        }}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}
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

                <div className="autocomplete-container">
                  <input
                    type="text"
                    placeholder="Enter tags (comma-separated)"
                    value={formFields.tags}
                    onChange={(e) => {
                      setFormFields({ ...formFields, tags: e.target.value });
                      handleTagSearch(e.target.value);
                    }}
                    onFocus={() => {
                      handleTagSearch(formFields.tags); // Show suggestions on focus
                      setShowSuggestions(true);
                    }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay hiding for clicks to register
                  />
                  {showSuggestions && filteredTags.length > 0 && (
                    <ul className="autocomplete-dropdown">
                      {filteredTags.map((tag, index) => (
                        <li
                          key={index}
                          onMouseDown={() => handleTagSelect(tag)}
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>


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
