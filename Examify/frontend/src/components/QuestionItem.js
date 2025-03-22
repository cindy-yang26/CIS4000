import React, { useState } from 'react';
import { MathJax } from 'better-react-mathjax';
import { FaEdit } from 'react-icons/fa';

const QuestionItem = ({ question, handleEditQuestion, handleDeleteTag, handleAddTag, handleSwapTag }) => {
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
      if (difficulty === 'Unrated') {
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
      <div className="question-text">
        <h3 className="question-title">{question.title}</h3>
        <h4 className="question-type-display">{formatQuestionType(question.questionType)}</h4>

        {/* Difficulty Display */}
        <div className="difficulty-display">
          <label>Difficulty:</label>
          {handleAddTag && handleDeleteTag ? ( // Render dropdown if handleAddTag and handleDeleteTag are provided
            <select
              value={difficulty}
              onChange={handleDifficultyChange}
              style={{ color: getDifficultyColor(difficulty) }}
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
        </div>

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
        <MathJax>{question.text}</MathJax>

        {/* Multiple Choice Options */}
        {question.questionType === "multiple_choice_question" && (
          <div style={{ marginTop: '5px' }}>
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

        {/* Correct Answer */}
        {question.correctAnswer && (
          <p><strong>Correct Answer:</strong> {question.correctAnswer}</p>
        )}

        {/* Question Statistics */}
        <div className="question-stats">
          Mean: {question.stats?.mean || 'N/A'},
          Median: {question.stats?.median || 'N/A'},
          Std Dev: {question.stats?.stdDev || 'N/A'},
          Min: {question.stats?.min || 'N/A'},
          Max: {question.stats?.max || 'N/A'}
        </div>

        {/* Question Comment */}
        {question.comment && (
          <div className="question-comment">
            <strong>Comment:</strong> {question.comment}
          </div>
        )}
      </div>

      {/* Edit Button */}
      {handleEditQuestion && ( // Only render edit button if handleEditQuestion is provided
        <div className="question-actions">
          <button
            className="edit-button"
            onClick={() => handleEditQuestion(question)}
          >
            <FaEdit />
          </button>
        </div>
      )}
    </li>
  );
};

export default QuestionItem;