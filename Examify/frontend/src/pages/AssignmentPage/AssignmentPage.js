import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import DownloadDropdown from '../../components/DownloadDropdown';
import { fetchAssignmentInfo, fetchAssignmentQuestions, uploadAssignmentToCanvas, downloadLatex, downloadDocs, updateAssignmentQuestions } from '../../api/assignments';
import { createQuestion, editQuestion, deleteQuestion, uploadImage, uploadFileContentToBackend } from '../../api/questions';
import { FaChevronLeft, FaEdit, FaDownload } from 'react-icons/fa';
import { FaAngleRight } from "react-icons/fa6";
import { fetchCourseInfo, getAllTags } from '../../api/courses';
import { MathJaxContext } from 'better-react-mathjax';
import QuestionItem from '../../components/QuestionItem'; // Import the new component
import { FaPlus } from 'react-icons/fa';
import QuestionForm from '../../components/QuestionForm';
  import './AssignmentPage.css';

function AssignmentPage() {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();

  const [assignmentName, setAssignmentName] = useState("");
  const [assignmentStatistics, setAssignmentStatistics] = useState({});
  const [courseName, setCourseName] = useState("");
  const [questions, setQuestions] = useState([]);
  const [showQuestionEditForm, setshowQuestionEditForm] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [images, setImages] = useState([]);
  const [formFields, setFormFields] = useState({
    title: '',
    text: '',
    comment: '',
    tags: '',
    questionType: 'essay_question',
    correctAnswer: '',
    stats: { mean: '', median: '', stdDev: '', min: '', max: '' },
  });

  const [editingQuestion, setEditingQuestion] = useState(null);
  const [tags, setTags] = useState([])
  const [filteredTags, setFilteredTags] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const loadCourseName = async () => {
      try {
        const courseInfo = await fetchCourseInfo(courseId, navigate);
        if (courseInfo == null) {
          return;
        }
        setCourseName(courseInfo.courseCode.replace(/-/g, ' '));
      } catch (error) {
        alert('Failed to load course name.');
        console.error(error);
      }
    };

    loadCourseName();
  }, [courseId, navigate]);

  useEffect(() => {
    const loadTags = async () => {
      try {
        const tagSet = await getAllTags(courseId, navigate);
        if (tagSet == null) {
          return;
        }
        setTags(tagSet);
      } catch (error) {
        alert('Failed to load tags.');
        console.error(error);
      }
    };
    loadTags();
  }, [courseId, navigate, showQuestionEditForm]);

  const handleAddQuestion = () => {
    setFormFields({
      title: '',
      text: '',
      comment: '',
      tags: '',
      questionType: 'essay_question',
      correctAnswer: '',
      stats: { mean: '', median: '', stdDev: '', min: '', max: '' },
      options: '',
    });
    setEditingQuestion(null);
    setImages([]);
    setShowForm(true);
  };
  
  const handleCancelQuestion = () => {
    setShowForm(false);
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

  const getUniqueTagsCount = () => {
    const difficultyTags = ['Easy', 'Medium', 'Hard'];
    const allTags = questions.flatMap((q) => q.tags).filter((t) => !difficultyTags.includes(t));
    const uniqueTags = new Set(allTags);
    return uniqueTags.size;
  };

  const calculateAverageDifficulty = () => {
    const difficultyValues = questions.map((q) => {
      const difficultyTags = ['Easy', 'Medium', 'Hard'];
      const foundDifficulty = q.tags.find((tag) => difficultyTags.includes(tag));
      if (foundDifficulty === 'Easy') return 1;
      if (foundDifficulty === 'Medium') return 5;
      if (foundDifficulty === 'Hard') return 10;
      return 0;
    });

    const total = difficultyValues.reduce((sum, value) => sum + value, 0);
    const average = total / questions.length || 0;
    return average.toFixed(2);
  };

  useEffect(() => {
    const loadAssignmentInfo = async () => {
      try {
        const assignmentInfo = await fetchAssignmentInfo(assignmentId, navigate);
        setAssignmentStatistics(assignmentInfo.statistics);
        setAssignmentName(assignmentInfo.name);
      } catch (error) {
        alert('Failed to load assignment name.');
        console.error(error);
      }
    };
    const loadQuestions = async () => {
      try {
        const data = await fetchAssignmentQuestions(assignmentId, navigate);
        setQuestions(data);
      } catch (error) {
        alert('Failed to load questions.');
        console.error(error);
      }
    };

    loadAssignmentInfo();
    loadQuestions();
  }, [assignmentId, navigate]);

  const handleEditAssignment = () => {
    navigate(`/course/${courseId}/assignment/${assignmentId}/edit-assignment`);
  };

  const handleReturnToCourse = () => {
    navigate(`/course/${courseId}`);
  };

  const cancelEdit = () => {
    setshowQuestionEditForm(false);
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
      correctAnswer: formFields.questionType === "true_false_question"
        ? (formFields.correctAnswer === "False" ? "False" : "True")
        : formFields.correctAnswer || "",
      stats: { ...formFields.stats },
      options: formFields.options ? formFields.options.split(',').map(opt => opt.trim()) : [],
      imageIds: images,
      assignmentId: assignmentId, // Add this line to associate with assignment
    };
  
    try {
      if (editingQuestion) {
        await editQuestion(editingQuestion.id, questionData, navigate);
      } else {
        const question = await createQuestion(questionData, navigate);
        console.log(question);
        await updateAssignmentQuestions(assignmentId, [...questions.map(x => x.id), question.id], navigate);
      }
  
      const updatedQuestions = await fetchAssignmentQuestions(assignmentId, navigate);
      setQuestions(updatedQuestions);
  
      setFormFields({
        title: '',
        text: '',
        comment: '',
        tags: '',
        questionType: 'essay_question',
        correctAnswer: '',
        stats: { mean: '', median: '', stdDev: '', min: '', max: '' },
        options: '',
      });
      setImages([]);
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
    setshowQuestionEditForm(true);
  };

  const handleDeleteTag = async (questionId, tagToDelete) => {
    try {
      const questionToUpdate = questions.find((q) => q.id === questionId);
      if (!questionToUpdate) return;

      const updatedTags = questionToUpdate.tags.filter((tag) => tag !== tagToDelete);

      const updatedQuestion = {
        ...questionToUpdate,
        tags: updatedTags,
      };

      await editQuestion(questionId, updatedQuestion, navigate);

      await setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q.id === questionId ? updatedQuestion : q
        )
      );
    } catch (error) {
      alert('Failed to delete tag.');
      console.error(error);
    }
  };

  const handleAddTag = async (questionId, newTag) => {
    try {
      const questionToUpdate = questions.find((q) => q.id === questionId);
      if (!questionToUpdate) return;

      const updatedTags = [...questionToUpdate.tags, newTag];

      const updatedQuestion = {
        ...questionToUpdate,
        tags: updatedTags,
      };

      await editQuestion(questionId, updatedQuestion, navigate);

      await setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q.id === questionId ? updatedQuestion : q
        )
      );
    } catch (error) {
      alert('Failed to add tag.');
      console.error(error);
    }
  };

  const handleSwapTag = async (questionId, oldTag, newTag) => {
    try {
      const questionToUpdate = questions.find((q) => q.id === questionId);
      if (!questionToUpdate) return;
  
      const updatedTags = questionToUpdate.tags.map((tag) =>
        tag === oldTag ? newTag : tag
      );
  
      const updatedQuestion = {
        ...questionToUpdate,
        tags: updatedTags,
      };
  
      await editQuestion(questionId, updatedQuestion, navigate);
  
      await new Promise((resolve) => {
        setQuestions((prevQuestions) => {
          const updatedQuestions = prevQuestions.map((q) =>
            q.id === questionId ? updatedQuestion : q
          );
          resolve(updatedQuestions);
          return updatedQuestions;
        });
      });
    } catch (error) {
      alert('Failed to swap tags.');
      console.error(error);
    }
  };

  const handleUploadToCanvas = async () => {
    try {
      const response = await uploadAssignmentToCanvas(courseId, assignmentName, assignmentId, navigate);
      if (response) {
        alert('Assignment uploaded to Canvas successfully!');
      } else {
        alert('Failed to upload assignment.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(error);
    }
  };

  const handleLatexDownload = async () => {
    try {
      const latex = await downloadLatex(assignmentId, navigate);
      const blob = new Blob([latex], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `assignment_${assignmentId}.tex`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to download LaTeX file.');
      console.error(error);
    }
  };

  const handleDocsDownload = async () => {
    try {
      await downloadDocs(assignmentId, navigate);
    } catch (error) {
      alert('Failed to download DOCX file.');
      console.error(error);
    }
  };

  return (
    <MathJaxContext>
      <div className="assignment-page">
        <Header />
        <div className="assignment-content">
          {/* Header section with back button, title, and buttons */}
          <div className="assignment-header">
            {/* Left side with back button and title */}
            <div className="header-left">
              <button className="back-button" onClick={handleReturnToCourse}>
                <FaChevronLeft />
              </button>
              
              <div className="assignment-title-section">
                <h2 className="assignment-title">{assignmentName.replace(/-/g, ' ')}</h2>
                <div className="course-label">Course: {courseName}</div>
              </div>
            </div>
            
            {/* Right side with buttons */}
            <div className="assignment-actions">
              <button
                className="edit-assignment-button"
                onClick={handleEditAssignment}
              >
                Select or Remove Questions
              </button>
              <button className="upload-button" onClick={handleUploadToCanvas}>
                Upload to Canvas
              </button>
              <DownloadDropdown
                onLatexDownload={handleLatexDownload}
                onDocsDownload={handleDocsDownload}
              />
            </div>
          </div>

          {/* Metrics section */}
          <div className="assignment-stat-summary-div">
            <div className="metrics-container">
              <div className="metrics">
                <div className="metric">
                  <strong>Number of Questions:</strong> {questions.length}
                </div>
                <div className="metric">
                  <strong>Topics Covered:</strong> {getUniqueTagsCount()}
                </div>
                <div className="metric">
                  <strong>Average Difficulty:</strong> {calculateAverageDifficulty()}
                </div>
              </div>
              <div className="view-metrics">
                <button className="view-metrics-button" onClick={() => navigate(`/course/${courseId}/assignment/${assignmentId}/difficulty`)}>
                  <div>View Details</div>
                  <div style={{fontSize: "2.1em"}}><FaAngleRight /></div>
                </button>
              </div>
            </div>
          </div>

          {/* Assignment statistics section */}
          {assignmentStatistics && Object.keys(assignmentStatistics).length > 0 && (
            <div className="assignment-statistics">
              <h3>Assignment Statistics</h3>
              <ul>
                {Object.entries(assignmentStatistics).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</strong>
                    <span>{value ?? 'N/A'}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Questions list */}
          <ul className="questions-list">
            {questions.map((question) => (
              <QuestionItem
                key={question.id}
                question={question}
                handleEditQuestion={handleEditQuestion}
                handleDeleteTag={handleDeleteTag}
                handleAddTag={handleAddTag}
                handleSwapTag={handleSwapTag}
              />
            ))}
          </ul>

          {/* Question editing form modal */}
          {showQuestionEditForm && (
            <div className="add-question-background">
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
                      handleTagSearch(formFields.tags);
                      setShowSuggestions(true);
                    }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
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

                <div className="form-buttons">
                  <button type="submit" className="submit-question-button">
                    Save Changes
                  </button>
                  <button type="button" onClick={cancelEdit} className="cancel-question-button">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Add Question Button */}
          <div className="add-question-container">
            <button className="add-question-button" onClick={handleAddQuestion}>
              <FaPlus />
              <span className="question-button-text">{' Add Question'}</span>
            </button>
          </div>

          {/* Question Form */}
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
        </div>
      </div>
    </MathJaxContext>
  );
}

export default AssignmentPage;