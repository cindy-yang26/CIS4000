import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { updateAssignmentQuestions, fetchAssignmentInfo, createAssignment, fetchAssignmentQuestions } from '../../api/assignments';
import { fetchCourseInfo, fetchCourseQuestions } from '../../api/courses';
import { FaChevronLeft } from 'react-icons/fa';
import './CreateAssignmentPage.css';

function EditAssignmentPage() {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();

  const [courseName, setCourseName] = useState('');
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [name, setAssignmentName] = useState("");
  
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
  }, [courseId, navigate]);

  useEffect(() => {
    const loadAssignmentInfo = async () => {
      try {
        const assignmentInfo = await fetchAssignmentInfo(assignmentId, navigate);
        setAssignmentName(assignmentInfo.name);
      } catch (error) {
        alert('Failed to load assignment name.');
        console.error(error);
      }
    };
  
    loadAssignmentInfo();
  }, [assignmentId, navigate]);

  useEffect(() => {
    const loadCourseQuestions = async () => {
      try {
        const questions = await fetchCourseQuestions(courseId, navigate);
        setAvailableQuestions(questions);
      } catch (error) {
        alert('Failed to load questions');
        console.error(error);
      }
    };
    
    const loadAssignmentQuestions = async () => {
      try {
        const data = await fetchAssignmentQuestions(assignmentId, navigate);
        setSelectedQuestions(data);
      } catch (error) {
        alert('Failed to load questions.');
        console.error(error);
      }
    };
    
    loadCourseQuestions();
    loadAssignmentQuestions();
  }, [assignmentId, courseId, navigate]);

  useEffect(() => {
    const filtered = availableQuestions.filter((question) => {
      return !selectedQuestions.some((selected) => selected.id === question.id);
    });
    
    setFilteredQuestions(filtered);
  }, [availableQuestions, selectedQuestions]);
   
  const handleReturnToAssignment = () => {
    navigate(`/course/${courseId}/assignment/${assignmentId}`);
  }

  const handleAddToAssignment = (question) => {
    setFilteredQuestions(filteredQuestions.filter((q) => q.id !== question.id));
    setSelectedQuestions([...selectedQuestions, question]);
  };

  const handleRemoveFromAssignment = (question) => {
    setSelectedQuestions(selectedQuestions.filter((q) => q.id !== question.id));
    setFilteredQuestions([...filteredQuestions, question]);
  };

  const handleUpdateAssignment = async () => {
    const questionIds = selectedQuestions.map((q) => q.id);
  
    try {
      await updateAssignmentQuestions(assignmentId, questionIds, navigate);
      alert("Assignment questions updated successfully!");
      navigate(`/course/${courseId}/assignment/${assignmentId}`);
    } catch (error) {
      alert("Failed to update assignment questions.");
      console.error(error);
    }
  };
  
  return (
    <div className="create-assignment-page">
      <Header />
      <div className="create-assignment-content">
        <div className="create-assignment-header">
          <button className="back-button" onClick={handleReturnToAssignment}>
            <FaChevronLeft />
          </button>
          <h2 className="create-assignment-title">Modify Questions for {name}</h2>
        </div>
        
        <div className="questions-container">
          {/* Available questions section */}
          <div className="available-questions">
            <h3 className="questions-section-title">Available Questions</h3>
            <div className="question-div">
              {filteredQuestions.length > 0 ? (
                <ul className="questions-list">
                  {filteredQuestions.map((question) => (
                    <li key={question.id} className="question-item">
                      <span className="question-title">{question.title}</span>
                      <button 
                        className="question-button add-button"
                        onClick={() => handleAddToAssignment(question)}
                      >
                        Add
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-state-message">
                  Add questions to {courseName} before modifying this assignment!
                </p>
              )}
            </div>
          </div>
          
          {/* Selected questions section */}
          <div className="selected-questions">
            <h3 className="questions-section-title">Selected Questions</h3>
            <div className="question-div">
              {selectedQuestions.length > 0 ? (
                <ul className="questions-list">
                  {selectedQuestions.map((question) => (
                    <li key={question.id} className="question-item">
                      <span className="question-title">{question.title}</span>
                      <button 
                        className="question-button remove-button"
                        onClick={() => handleRemoveFromAssignment(question)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-state-message">
                  No questions selected yet. Add some from the left panel.
                </p>
              )}
            </div>
          </div>
        </div>
        
        <button className="update-assignment-button" onClick={handleUpdateAssignment}>
          Update Assignment
        </button>
      </div>
    </div>
  );
}

export default EditAssignmentPage;