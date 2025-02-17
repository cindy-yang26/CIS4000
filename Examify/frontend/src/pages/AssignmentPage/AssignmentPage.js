import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { fetchAssignmentInfo, fetchAssignmentQuestions, uploadAssignmentToCanvas } from '../../api/assignments';
import { fetchCourseInfo } from '../../api/courses';
import { editQuestion } from '../../api/questions';
import { FaChevronLeft, FaEdit, FaTrash } from 'react-icons/fa';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import './AssignmentPage.css';

function AssignmentPage() {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();

  const [assignmentName, setAssignmentName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
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
    const loadAssignmentName = async () => {
      try {
        const assignmentInfo = await fetchAssignmentInfo(assignmentId, navigate);
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

    loadAssignmentName();
    loadQuestions();
  }, [assignmentId]);

  const handleReturnToCourse = () => {
    navigate(`/course/${courseId}`);
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
      title: formFields.title,
      text: formFields.text,
      comment: formFields.comment,
      tags: tagsArray,
      questionType: formFields.questionType,
      correctAnswer: formFields.correctAnswer || "",
      stats: { ...formFields.stats },
      options: formFields.options ? formFields.options.split(',').map(opt => opt.trim()) : [],
      correctAnswer: formFields.questionType === "true_false_question"
      ? (formFields.correctAnswer === "False" ? "False" : "True")
      : formFields.correctAnswer || "",
    };
  
    try {
      if (editingQuestion) {
        await editQuestion(editingQuestion.id, questionData, navigate);
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
  

  const handleDeleteTag = (questionId, tagToDelete) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? { ...q, tags: q.tags.filter((tag) => tag !== tagToDelete) }
          : q
      )
    );
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

  const formatQuestionType = (questionType) => {
    const typeMap = {
      "multiple_choice_question": "MCQ",
      "essay_question": "Long Response",
      "true_false_question": "True/False",
      "numerical_question": "Numerical",
    };
    
    return typeMap[questionType] || "Long Response"; 
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
            <button className="upload-button" onClick={handleUploadToCanvas}>
              Upload to Canvas
            </button>
          </div>

          <ul className="questions-list">
            {questions.map((question) => (
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
                  <button
                    className="edit-button"
                    onClick={() => handleEditQuestion(question)}
                  >
                    <FaEdit />
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
              <textarea
                placeholder="Enter your question"
                value={formFields.text}
                onChange={(e) =>
                  setFormFields({ ...formFields, text: e.target.value })
                }
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
                Save Changes
              </button>
            </form>
          )}
        </div>
      </div>
    </MathJaxContext>
  );
}

export default AssignmentPage;
