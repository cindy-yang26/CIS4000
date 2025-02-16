import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { fetchAssignmentInfo, fetchAssignmentQuestions, uploadAssignmentToCanvas, downloadLatex } from '../../api/assignments';
import { FaChevronLeft, FaEdit, FaDownload } from 'react-icons/fa';
import { fetchCourseInfo } from '../../api/courses';
import { editQuestion } from '../../api/questions';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import './AssignmentPage.css';

function AssignmentPage() {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();

  const [assignmentName, setAssignmentName] = useState("");
  const [assignmentStatistics, setAssignmentStatistics] = useState({});
  const [courseName, setCourseName] = useState("");
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formFields, setFormFields] = useState({
    title: '',
    text: '',
    comment: '',
    tags: '',
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
  }, [assignmentId]);

  const handleReturnToCourse = () => {
    navigate(`/course/${courseId}`);
  };

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
        await editQuestion(editingQuestion.id, questionData, navigate);
        const updatedQuestions = await fetchAssignmentQuestions(assignmentId, navigate);
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
      alert('Failed to save question.');
      console.error(error);
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setFormFields({
      title: question.title,
      text: question.text,
      comment: question.comment || '',
      tags: (question.tags || []).join(', '),
      stats: { ...question.stats },
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

  const handleLatexDownload = async () => {
    try {
      const latex = await downloadLatex(assignmentId, navigate);
      // Create a blob and download it
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
            <div className="assignment-actions">
              <button className="download-button" onClick={handleLatexDownload}>
                <FaDownload /> LaTeX
              </button>
              <button className="upload-button" onClick={handleUploadToCanvas}>
                Upload to Canvas
              </button>
            </div>
          </div>

          {assignmentStatistics && Object.keys(assignmentStatistics).length > 0 && (
            <div className="assignment-statistics">
              <h3>Assignment Statistics</h3>
              <ul>
                {Object.entries(assignmentStatistics).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {value ?? 'N/A'}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ul className="questions-list">
            {questions.map((question) => (
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
