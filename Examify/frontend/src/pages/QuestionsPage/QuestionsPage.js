import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCourseInfo, fetchCourseQuestions, getAllTags } from '../../api/courses';
import { createQuestion, editQuestion, deleteQuestion, uploadImage, uploadFileContentToBackend } from '../../api/questions';
import Header from '../../components/Header/Header';
import { FaChevronLeft, FaEdit, FaTrash, FaPlus, FaEye, FaSearch, FaUpload } from 'react-icons/fa';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import { fetchQuestionVariants, createQuestionVariant } from "../../api/variants";
import './QuestionsPage.css';
import QuestionForm from '../../components/QuestionForm';
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
  const [images, setImages] = useState([]);

  useEffect(() => {
    const loadCourseName = async () => {
      try {
        const courseInfo = await fetchCourseInfo(courseId, navigate);
        if (courseInfo == null) {
          return;
        }
        setCourseName(courseInfo.courseCode.replace(/-/g, ' '));
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

  const handleUploadImage = async (e) => {
    e.preventDefault();

    for (const file of e.target.files) {
      const fileExt = file.name.split('.').pop().toLowerCase();
      try {
        const reader = new FileReader();

        reader.onloadend = async () => {
          const base64String = reader.result.split(",")[1];
          const imageInfo = await uploadImage(courseId, fileExt, base64String, navigate);

          if (imageInfo) {
            // Store only the image ID in the state
            setImages(prevImages => [...prevImages, imageInfo.imageId]);
          } else {
            console.error("Failed to upload image.");
            alert("Failed to upload image.");
          }
        };

        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error processing image:', error);
        alert('Failed to process image.');
      }
    }
  };

  const handleRemoveImage = (imageId) => {
    setImages((prevImages) => prevImages.filter((id) => id !== imageId));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Split and clean tags
    const tagsArray = formFields.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag);

    // Split and clean options (if applicable)
    let optionsArray = formFields.options ? formFields.options.split(',').map(opt => opt.trim()) : [];

    // Validation for empty title
    if (!formFields.title.trim()) {
      alert("Title cannot be empty.");
      return;
    }

    // Validation for multiple-choice questions
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

    // Validation for true/false questions
    if (formFields.questionType === "true_false_question" && !formFields.correctAnswer) {
      alert("True/False questions must have a correct answer.");
      return;
    }

    // Validation for numerical questions
    if (formFields.questionType === "numerical_question" && (formFields.correctAnswer === "" || isNaN(formFields.correctAnswer))) {
      alert("Numerical questions must have a valid numerical answer.");
      return;
    }

    // Prepare the question data for submission
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
      imageIds: images, // Include the uploaded image IDs
    };

    try {
      if (editingQuestion) {
        // Edit the existing question
        await editQuestion(editingQuestion.id, questionData, navigate);

        // Update variants if this is a variant
        if (editingQuestion.originalQuestionId) {
          const updatedVariants = await fetchQuestionVariants(editingQuestion.originalQuestionId);
          setVariants((prev) => ({
            ...prev,
            [editingQuestion.originalQuestionId]: updatedVariants,
          }));
        } else {
          // Update the main questions list
          const updatedQuestions = await fetchCourseQuestions(courseId, navigate);
          setQuestions(updatedQuestions);
        }
      } else {
        // Create a new question
        await createQuestion(questionData, navigate);
      }

      // Reset form fields and images state
      setFormFields({
        title: '',
        text: '',
        comment: '',
        tags: '',
        questionType: 'essay_question',
        stats: { mean: '', median: '', stdDev: '', min: '', max: '' },
        options: '',
        correctAnswer: '',
      });
      setImages([]); // Clear the images state
      setShowForm(false);
    } catch (error) {
      alert("Failed to save question");
      console.error(error);
    }
  };

  const handleEditQuestion = (question, originalQuestionId = null) => {
    setEditingQuestion(question);
    setImages(question.images.map((image) => image.id));
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

  const handleAddTag = async (questionId, newTag) => {
    console.log("HandleAddTag", newTag);
    try {
      // Find the question to update
      const questionToUpdate = questions.find((q) => q.id === questionId);
      if (!questionToUpdate) return;

      // Add the new tag to the question's tags
      console.log(questionToUpdate.tags);
      const updatedTags = [...questionToUpdate.tags, newTag];

      // Prepare the updated question data
      const updatedQuestion = {
        ...questionToUpdate,
        tags: updatedTags,
      };

      // Call the API to update the question
      await editQuestion(questionId, updatedQuestion, navigate);

      // Update the local state
      await setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q.id === questionId ? updatedQuestion : q
        )
      );
    } catch (error) {
      alert('Failed to add tag.');
      console.error(error);
    }
    console.log("END HandleAddTag");
  };

  const handleSwapTag = async (questionId, oldTag, newTag) => {
    console.log("HandleSwapTag", oldTag, newTag);
    try {
      // Find the question to update
      const questionToUpdate = questions.find((q) => q.id === questionId);
      if (!questionToUpdate) return;

      // Swap the old tag with the new tag
      const updatedTags = questionToUpdate.tags.map((tag) =>
        tag === oldTag ? newTag : tag
      );

      // Prepare the updated question data
      const updatedQuestion = {
        ...questionToUpdate,
        tags: updatedTags,
      };

      // Call the API to update the question
      await editQuestion(questionId, updatedQuestion, navigate);

      // Update the local state
      await new Promise((resolve) => {
        setQuestions((prevQuestions) => {
          const updatedQuestions = prevQuestions.map((q) =>
            q.id === questionId ? updatedQuestion : q
          );
          resolve(updatedQuestions); // Resolve the Promise after state update
          return updatedQuestions;
        });
      });

      console.log("Updated Tags:", updatedTags);
    } catch (error) {
      alert('Failed to swap tags.');
      console.error(error);
    }
    console.log("END HandleSwapTag");
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

  const handleDeleteTag = async (questionId, tagToDelete) => {
    console.log("HandleDeleteTag", tagToDelete);
    try {
      // Find the question to update
      const questionToUpdate = questions.find((q) => q.id === questionId);
      if (!questionToUpdate) return;

      // Remove the tag from the question's tags
      const updatedTags = questionToUpdate.tags.filter((tag) => tag !== tagToDelete);

      // Prepare the updated question data
      const updatedQuestion = {
        ...questionToUpdate,
        tags: updatedTags,
      };

      // Call the API to update the question
      await editQuestion(questionId, updatedQuestion, navigate);

      // Update the local state
      await setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q.id === questionId ? updatedQuestion : q
        )
      );
      console.log(updatedTags);
      console.log(questions);
    } catch (error) {
      alert('Failed to delete tag.');
      console.error(error);
    }

    console.log("END HandleDeleteTag");
  };

  // Handle difficulty change
  const handleDifficultyChange = (questionId) => async (e) => {
    try {
      const newDifficulty = e.target.value;
      const questionToUpdate = questions.find((q) => q.id === questionId);
      if (!questionToUpdate) return;

      const difficultyTags = ['Easy', 'Medium', 'Hard'];
      const currentDifficulty = questionToUpdate.tags.find((tag) => difficultyTags.includes(tag));

      if (currentDifficulty === undefined) {
        await handleAddTag(questionId, newDifficulty);
      } else if (newDifficulty === 'Unrated') {
        await handleDeleteTag(questionId, currentDifficulty);
      } else {
        await handleSwapTag(questionId, currentDifficulty, newDifficulty);
      }

      // Update the local state
      const updatedQuestions = questions.map((q) =>
        q.id === questionId
          ? {
            ...q,
            tags: q.tags.filter((tag) => !difficultyTags.includes(tag)).concat(newDifficulty === 'Unrated' ? [] : [newDifficulty]),
          }
          : q
      );
      setQuestions(updatedQuestions);
    } catch (error) {
      console.error('Failed to update difficulty:', error);
      alert('Failed to update difficulty. Please try again.');
    }
  };

  const filteredQuestions = questions
    .filter((question) => question.originalQuestionId == null)
    .filter((question) => {
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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'green';
      case 'Medium':
        return 'orange';
      case 'Hard':
        return 'red';
      default:
        return 'black'; // Default color for "Unrated"
    }
  };

  return (
    <MathJaxContext>
      <div className="questions-page">
        <Header />
        <div className="questions-content">
          <div className="questions-header">
            {/* Left side with back button and title */}
            <div className="header-left">
              <button className="back-button" onClick={handleReturnToCourse}>
                <FaChevronLeft />
              </button>

              <div className="course-title-section">
                <h2 className="course-name">{courseName}</h2>
                <div className="questions-header-div">Questions</div>
              </div>
            </div>

            {/* Right side with buttons */}
            <div className="header-right">
              <button className="add-question-button" onClick={handleAddQuestion}>
                <FaPlus />
                <span className="question-button-text">{' Add Question'}</span>
              </button>
              <button className="upload-document-button">
                <label htmlFor="upload-document" style={{ cursor: "pointer", margin: "0" }}>
                  <FaUpload style={{marginRight: "5px"}}/>
                  Upload Document
                </label>
                <input
                  type="file"
                  id="upload-document"
                  style={{ display: "none" }}
                  accept=".docx,.txt"
                  onChange={handleUploadDocument}
                />
              </button>
            </div>
          </div>

          <div className="question-search-div">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search questions by title, tags, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="question-search-input"
            />
          </div>

          <ul className="questions-list">
            {filteredQuestions.map((question) => {
              const difficultyTags = ['Easy', 'Medium', 'Hard'];
              const difficulty = question.tags.find((tag) => difficultyTags.includes(tag)) || 'Unrated';
              const filteredTags = question.tags.filter((tag) => !difficultyTags.includes(tag));

              return (
                <li key={question.id} className="question-item">
                  <div className="question-content">
                    <div className="question-text" style={{ width: '100%' }}>
                      <div className="question-header">
                        <h3 className="question-title">
                          {question.title}
                          <span className="difficulty-dropdown">
                            {handleAddTag && handleDeleteTag ? ( // Render dropdown if handleAddTag and handleDeleteTag are provided
                              <select
                                value={difficulty}
                                onChange={handleDifficultyChange(question.id)}
                                className="difficulty-dropdown"
                                style={{ color: getDifficultyColor(difficulty), borderColor: getDifficultyColor(difficulty) }}
                              >
                                <option value="Unrated">Unrated</option>
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                              </select>
                            ) : ( // Render static box if handleAddTag or handleDeleteTag is null
                              <span style={{ color: getDifficultyColor(difficulty) }}>
                                {difficulty}
                              </span>
                            )}
                          </span>
                        </h3>
                      </div>
                      <h4 className="question-type-display">{formatQuestionType(question.questionType)}</h4>

                      {/* Tags */}
                      {filteredTags.length > 0 && (
                        <div className="question-tags">
                          {filteredTags.map((tag, index) => (
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

                      {/* Question Text */}
                      <div className="question">
                        <MathJax>{question.text}</MathJax>
                      </div>

                      {/* Render the associated images */}
                      {question.images && question.images.length > 0 && (
                        <div className="question-images">
                          {question.images.map((image, index) => (
                            <img
                              key={index}
                              src={image.url}
                              alt={`Question Image ${index + 1}`}
                              className="question-image"
                            />
                          ))}
                        </div>
                      )}

                      {/* Multiple Choice Options */}
                      {question.questionType === "multiple_choice_question" && (
                        <div className="mc-div">
                          <ul className="mc-choice-list">
                            {Array.isArray(question.options) && question.options.length > 0
                              ? question.options.map((choice, index) => (
                                <li
                                  key={index}
                                  className="mc-choice"
                                >
                                  <strong>{String.fromCharCode(65 + index)})</strong>
                                  <span>{choice}</span>
                                </li>
                              ))
                              : <li>No options provided</li>}
                          </ul>
                        </div>
                      )}

                      {/* Correct Answer */}
                      <div className="correct-answer">
                        {question.correctAnswer && (
                          <p><strong>Answer:</strong> {question.correctAnswer}</p>
                        )}
                      </div>

                      {/* Question Comment */}
                      {question.comment && (
                        <div className="question-comment">
                          <strong>Comment:</strong> {question.comment}
                        </div>
                      )}

                      <div className="variant-controls">
                        <button className="view-variants-button" onClick={() => handleViewVariants(question.id)}>
                          <FaEye /> {expandedQuestion === question.id ? 'Hide Variants' : 'View Variants'}
                        </button>
                        <button className="create-variant-button" onClick={() => handleCreateVariant(question)}>
                          <FaPlus /> Create Variant
                        </button>
                      </div>

                      {/* Variants Section */}
                      {expandedQuestion === question.id && (
                        <div className="variants-list">
                          {loadingVariants[question.id] ? (
                            <p>Loading variants...</p>
                          ) : variants[question.id]?.length > 0 ? (
                            variants[question.id].map((variant) => (
                              <div key={variant.id} className="variant-item">

                                <h4 className="question-title" style={{ marginBottom: "5px" }}>
                                  {variant.title}
                                </h4>

                                <div className="question">
                                  <MathJax>{variant.text}</MathJax>
                                </div>

                                {/* Show Answer Choices if MCQ */}
                                {variant.questionType === 'multiple_choice_question' && variant.options?.length > 0 && (
                                  <div className="mc-div">
                                    <ul className="mc-choice-list">
                                      {Array.isArray(variant.options) && variant.options.length > 0
                                        ? variant.options.map((choice, index) => (
                                          <li
                                            key={index}
                                            className="mc-choice"
                                          >
                                            <strong>{String.fromCharCode(65 + index)})</strong>
                                            <span>{choice}</span>
                                          </li>
                                        ))
                                        : <li>No options provided</li>}
                                    </ul>
                                  </div>
                                )}

                                {/* Correct Answer */}
                                <div className="correct-answer">
                                  {variant.correctAnswer && (
                                    <p><strong>Answer: </strong>{variant.correctAnswer}</p>
                                  )}
                                </div>

                                {/* Variant Comment */}
                                {variant.comment && (
                                  <div className="question-comment">
                                    <strong>Comment:</strong> {variant.comment}
                                  </div>
                                )}

                                {/* Question Statistics */}
                                <div className="variant-stats">
                                  <strong>Statistics: </strong>
                                  Mean: {variant.stats?.mean || '--'},
                                  Median: {variant.stats?.median || '--'},
                                  Std Dev: {variant.stats?.stdDev || '--'},
                                  Min: {variant.stats?.min || '--'},
                                  Max: {variant.stats?.max || '--'}
                                </div>

                                {/* Edit & Delete Buttons */}
                                <div className="variant-actions">
                                  <button className="delete-button" style={{ float: "right" }} onClick={() => handleDeleteQuestion(variant.id, question.id)}>
                                    <FaTrash />
                                  </button>
                                  <button className="edit-button" style={{ float: "right" }} onClick={() => handleEditQuestion(variant)}>
                                    <FaEdit />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p style={{ fontSize: "0.9em" }}>No variants available.</p>
                          )}
                        </div>
                      )}

                    </div>

                    {/* Question Statistics */}
                    <div className="question-stats">
                      <h3 className="question-title" style={{ marginBottom: "10px" }}>Statistics</h3>
                      <div className="stat-details">
                        <span>Mean:</span>
                        <span>{question.stats?.mean || '--'}</span>
                      </div>
                      <div className="stat-details">
                        <span>Median:</span>
                        <span>{question.stats?.median || '--'}</span>
                      </div>
                      <div className="stat-details">
                        <span>Std Dev:</span>
                        <span>{question.stats?.stdDev || '--'}</span>
                      </div>
                      <div className="stat-details">
                        <span>Min:</span>
                        <span>{question.stats?.min || '--'}</span>
                      </div>
                      <div className="stat-details">
                        <span>Max:</span>
                        <span>{question.stats?.max || '--'}</span>
                      </div>
                    </div>

                    {/* Edit and Delete Buttons */}
                    <div className="question-actions">
                      <button className="edit-button" onClick={() => handleEditQuestion(question)}>
                        <FaEdit />
                      </button>
                      <button
                        className="delete-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAttemptDelete(true);
                        }}
                      >
                        <FaTrash />
                      </button>
                    </div>

                    {/* Delete Confirmation Modal */}
                    {attemptDelete && (
                      <div className="modal-background">
                        <div className="delete-confirmation-window">
                          <h3 id="link-canvas-title">Delete Question?</h3>
                          <p>This action cannot be undone.</p>
                          <div className="window-button-div">
                            <button
                              className="delete-confirmation-button"
                              id="delete-question-confirmation-button"
                              onClick={() => handleDeleteQuestion(question.id)}
                            >
                              Delete
                            </button>
                            <button
                              className="link-canvas-window-button"
                              id="add-course-cancel"
                              onClick={() => setAttemptDelete(false)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>


          {showForm && (
            <QuestionForm
              showForm={showForm}
              editingQuestion={editingQuestion}
              formFields={formFields}
              setFormFields={setFormFields}
              handleFormSubmit={handleFormSubmit}
              handleCancelQuestion={handleCancelQuestion}
              tags={tags}
              images={images}
              setImages={setImages}
              handleUploadImage={handleUploadImage}
              handleRemoveImage={handleRemoveImage}
            />
          )}
        </div>
      </div>
    </MathJaxContext>
  );
}

export default QuestionsPage;
