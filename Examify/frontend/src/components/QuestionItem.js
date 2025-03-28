import React, { useState } from 'react';
import { MathJax } from 'better-react-mathjax';
import { FaEdit, FaTrash } from 'react-icons/fa';
import '../pages/AssignmentPage/AssignmentPage.css';

const QuestionItem = ({ question, handleEditQuestion, handleDeleteTag, handleAddTag, handleSwapTag, renderVariantControls, renderVariantsSection, attemptDelete, setAttemptDelete, handleDeleteQuestion, questions, setQuestions }) => {
  // State to manage the selected difficulty
  const [difficulty, setDifficulty] = useState(() => {
    // Check if the tags contain "Easy", "Medium", or "Hard"
    const difficultyTags = ['Easy', 'Medium', 'Hard'];
    const foundDifficulty = question.tags.find((tag) => difficultyTags.includes(tag));
    return foundDifficulty || 'Unrated'; // Default to "Unrated" if no difficulty tag is found
  });

  // Handle difficulty change
  const handleDifficultyChange = async (e) => {
    const newDifficulty = e.target.value;

    try {
      // Remove the old difficulty tag (if it exists and is not "Unrated")
      if (difficulty === undefined) {
        await handleAddTag(question.id, newDifficulty);
      } else if (newDifficulty === 'Unrated') {
        await handleDeleteTag(question.id, difficulty);
      } else {
        handleSwapTag(question.id, difficulty, newDifficulty);
      }

      // Update the state only after the tags have been updated
      setDifficulty(newDifficulty);
    } catch (error) {
      console.error('Failed to update difficulty:', error);
      alert('Failed to update difficulty. Please try again.');
    }
  };

  // Format question type for display
  const formatQuestionType = (questionType) => {
    const typeMap = {
      "multiple_choice_question": "MCQ",
      "essay_question": "Long Response",
      "true_false_question": "True/False",
      "numerical_question": "Numerical",
    };
    return typeMap[questionType] || "Long Response";
  };

  // Get the color for the difficulty text
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

  // Filter out difficulty tags
  const filteredTags = question.tags.filter(
    (tag) => !['Easy', 'Medium', 'Hard'].includes(tag)
  );

  return (
    <li key={question.id} className="question-item">
      <div className="question-content">
        <div className="question-text">
          <div className="question-header">
            <h3 className="question-title">
              {question.title}
              <span className="difficulty-dropdown">
                {handleAddTag && handleDeleteTag ? ( // Render dropdown if handleAddTag and handleDeleteTag are provided
                  <select
                    value={difficulty}
                    onChange={handleDifficultyChange}
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
                  {handleDeleteTag && ( // Only render delete button if handleDeleteTag is provided
                    <button
                      className="delete-tag-button"
                      onClick={() => handleDeleteTag(question.id, tag)}
                    >
                      ✕
                    </button>
                  )}
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
                  style={{ maxHeight: "500px", maxWidth: "500px" }}
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

          {/* Variant Controls and Variant Section */}
          {renderVariantControls && renderVariantControls(question)}
          {renderVariantsSection && renderVariantsSection(question)}
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
          {handleEditQuestion && ( // Only render edit button if handleEditQuestion is provided
            <button
              className="edit-button"
              onClick={() => handleEditQuestion(question)}
            >
              <FaEdit />
            </button>
          )}
          {setAttemptDelete && handleDeleteQuestion && (
            <button
              className="delete-button"
              onClick={(e) => {
                e.stopPropagation();
                setAttemptDelete(question.id);
              }}
            >
              <FaTrash />
            </button>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {attemptDelete === question.id && handleDeleteQuestion && setAttemptDelete && (
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
                  onClick={() => setAttemptDelete(null)}
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
};

export default QuestionItem;