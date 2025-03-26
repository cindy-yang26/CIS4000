import React, { useState, useEffect } from 'react';
import './QuestionForm.css';

function QuestionForm({ 
  showForm, 
  editingQuestion, 
  formFields, 
  setFormFields, 
  handleFormSubmit, 
  handleCancelQuestion,
  tags,
  images = [],
  setImages,
  handleUploadImage,
  handleRemoveImage
}) {
  const [filteredTags, setFilteredTags] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  if (!showForm) return null;

  return (
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

        {handleUploadImage && (
          <div className="upload-image-container">
            <label>Upload Associated Images:</label>
            <button type="button" className="upload-image-for-new-question">
              <label htmlFor="upload-image-for-new-question" style={{ cursor: "pointer" }}>
                Upload Image
              </label>
              <input
                type="file"
                id="upload-image-for-new-question"
                style={{ display: "none" }}
                accept=".jpg,.png,.svg,.jpeg,.bmp,.tiff,.heic"
                onChange={handleUploadImage}
              />
            </button>
          </div>
        )}

        {setImages && (
          <div className="uploaded-images-container">
            {images.map((imageId, index) => (
              <div key={index} className="uploaded-image">
                <span>Image {index + 1} (ID: {imageId})</span>
                <button
                  className="remove-image-button"
                  onClick={() => handleRemoveImage(imageId)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

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

        <button type="submit" className="submit-question-button">
          {editingQuestion ? 'Save Changes' : 'Add Question'}
        </button>
        <button type="button" className="cancel-question-button" onClick={handleCancelQuestion}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default QuestionForm;    