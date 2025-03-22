import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import DownloadDropdown from '../../components/DownloadDropdown';
import { fetchAssignmentInfo, fetchAssignmentQuestions, uploadAssignmentToCanvas, downloadLatex, downloadDocs } from '../../api/assignments';
import { FaChevronLeft, FaEdit, FaDownload } from 'react-icons/fa';
import { fetchCourseInfo } from '../../api/courses';
import { editQuestion } from '../../api/questions';
import { MathJaxContext } from 'better-react-mathjax';
import QuestionItem from '../../components/QuestionItem'; // Import the new component
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

  const handleEditAssignment = () => {
    navigate(`/course/${courseId}/assignment/${assignmentId}/edit-assignment`);
  };

  const handleReturnToCourse = () => {
    navigate(`/course/${courseId}`);
  };

  const cancelEdit = () => {
    setShowForm(false);
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
          <div className="assignment-header">
            <button className="back-button" onClick={handleReturnToCourse}>
              <FaChevronLeft />
            </button>
            <h2 className="assignment-title">
              {assignmentName.replace(/-/g, ' ')} (Course: {courseName.replace(/-/g, ' ')})
            </h2>
            <div className="assignment-actions">
              <DownloadDropdown
                onLatexDownload={handleLatexDownload}
                onDocsDownload={handleDocsDownload}
              />
              <button className="upload-button" onClick={handleUploadToCanvas}>
                Upload to Canvas
              </button>
            </div>
            <button
              className="edit-assignment-button"
              onClick={handleEditAssignment}
            >
              Select or remove questions
            </button>
            <button
              className="difficulty-button"
              onClick={() => navigate(`/course/${courseId}/assignment/${assignmentId}/difficulty`)}
            >
              View Assignment Difficulty
            </button>
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

          {showForm ? (
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
                <button onClick={cancelEdit} className="cancel-question-button">
                  Cancel
                </button>
              </form>
            </div>
          ) : (
            <p></p>
          )}
        </div>
      </div>
    </MathJaxContext>
  );
}

export default AssignmentPage;