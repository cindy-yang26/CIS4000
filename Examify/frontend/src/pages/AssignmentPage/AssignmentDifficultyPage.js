import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { fetchAssignmentInfo, fetchAssignmentQuestions } from '../../api/assignments';
import { MathJaxContext } from 'better-react-mathjax';
import { FaChevronLeft } from 'react-icons/fa';
import QuestionItem from '../../components/QuestionItem'; // Import the QuestionItem component
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AssignmentDifficultyPage.css'; // Ensure you import the same CSS file for consistent styling

function AssignmentDifficultyPage() {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [overallStats, setOverallStats] = useState({
    mean: 0,
    median: 0,
    stdDev: 0,
    min: 0,
    max: 0,
  });

  const [missingStats, setMissingStats] = useState({});
  const [showMissingStats, setShowMissingStats] = useState(false); // State to control dropdown visibility
  const [assignmentName, setAssignmentName] = useState(""); // State to store assignment name

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

    const loadQuestions = async () => {
      try {
        const fetchedQuestions = await fetchAssignmentQuestions(assignmentId, navigate);
        setQuestions(fetchedQuestions);

        // Initialize missingStats for all questions
        const initialMissingStats = {};
        fetchedQuestions.forEach((q) => {
          initialMissingStats[q.id] = {
            mean: q.stats?.mean ?? '',
            median: q.stats?.median ?? '',
            stdDev: q.stats?.stdDev ?? '',
            min: q.stats?.min ?? '',
            max: q.stats?.max ?? '',
          };
        });

        setMissingStats(initialMissingStats);
      } catch (error) {
        alert('Failed to load questions.');
        console.error(error);
      }
    };

    loadAssignmentInfo();
    loadQuestions();
  }, [assignmentId, navigate]);

  // Handle input changes for missing stats
  const handleInputChange = (questionId, stat, value) => {
    console.log(`Updating ${stat} for question ${questionId}:`, value);
    setMissingStats((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [stat]: value,
      },
    }));
  };

  // Calculate overall statistics whenever missingStats changes
  useEffect(() => {
    calculateOverallStats();
  }, [missingStats]); // Re-run when missingStats changes

  // Calculate overall statistics, including user input for missing stats
  const calculateOverallStats = () => {
    console.log('Calculating overall stats...');
    let totalMean = 0,
      totalMedian = 0,
      totalStdDev = 0,
      totalMin = 0,
      totalMax = 0;
    let count = 0;

    questions.forEach((q) => {
      const stats = missingStats[q.id]; // Use the modified stats from missingStats
      console.log(`Question ${q.id} stats:`, stats);

      const mean = parseFloat(stats.mean);
      const median = parseFloat(stats.median);
      const stdDev = parseFloat(stats.stdDev);
      const min = parseFloat(stats.min);
      const max = parseFloat(stats.max);

      if (!isNaN(mean)) totalMean += mean;
      if (!isNaN(median)) totalMedian += median;
      if (!isNaN(stdDev)) totalStdDev += stdDev;
      if (!isNaN(min)) totalMin += min;
      if (!isNaN(max)) totalMax += max;

      if (!isNaN(mean) || !isNaN(median) || !isNaN(stdDev) || !isNaN(min) || !isNaN(max)) {
        count++;
      }
    });

    console.log('Total values:', { totalMean, totalMedian, totalStdDev, totalMin, totalMax });
    console.log('Count:', count);

    if (count === 0) {
      setOverallStats({
        mean: 0,
        median: 0,
        stdDev: 0,
        min: 0,
        max: 0,
      });
    } else {
      setOverallStats({
        mean: (totalMean).toFixed(2),
        median: (totalMedian).toFixed(2),
        stdDev: (totalStdDev).toFixed(2),
        min: (totalMin).toFixed(2),
        max: (totalMax).toFixed(2),
      });
    }

    console.log('Updated overallStats:', overallStats);
  };

  // Toggle the visibility of the missing stats dropdown
  const toggleMissingStats = () => {
    setShowMissingStats((prev) => !prev);
  };

  // Calculate the count of questions for each difficulty level
  const getDifficultyCounts = () => {
    const difficultyCounts = {
      Easy: 0,
      Medium: 0,
      Hard: 0,
      Unrated: 0,
    };

    questions.forEach((q) => {
      const difficultyTags = ['Easy', 'Medium', 'Hard'];
      const foundDifficulty = q.tags.find((tag) => difficultyTags.includes(tag));
      const difficulty = foundDifficulty || 'Unrated';
      difficultyCounts[difficulty]++;
    });

    // Add a fill property based on difficulty
    return Object.entries(difficultyCounts).map(([difficulty, count]) => ({
      difficulty,
      count,
      fill: difficulty === 'Easy' ? '#82ca9d' : difficulty === 'Medium' ? '#ffc658' : '#ff6c6c', // Green, Yellow, Red
    }));
  };

  // Helper function to calculate the number of unique tags
  const getUniqueTagsCount = () => {
    const difficultyTags = ['Easy', 'Medium', 'Hard'];
    const allTags = questions.flatMap((q) => q.tags).filter((t) => !difficultyTags.includes(t)); // Flatten all tags into a single array
    const uniqueTags = new Set(allTags); // Use a Set to get unique tags
    return uniqueTags.size; // Return the number of unique tags
  };

  // Helper function to calculate the average difficulty rating
  const calculateAverageDifficulty = () => {
    const difficultyValues = questions.map((q) => {
      const difficultyTags = ['Easy', 'Medium', 'Hard'];
      const foundDifficulty = q.tags.find((tag) => difficultyTags.includes(tag));
      if (foundDifficulty === 'Easy') return 1;
      if (foundDifficulty === 'Medium') return 5;
      if (foundDifficulty === 'Hard') return 10;
      return 0; // Unrated questions contribute 0 to the average
    });

    const total = difficultyValues.reduce((sum, value) => sum + value, 0);
    const average = total / questions.length || 0; // Avoid division by zero
    return average.toFixed(2); // Round to 2 decimal places
  };

  // Data for the bar chart
  const difficultyData = getDifficultyCounts();

  const handleReturnToAssignment = () => {
    navigate(`/course/${courseId}/assignment/${assignmentId}`);
  }

  return (
    <MathJaxContext>
      <div className="assignment-page">
        <Header />
        <div className="assignment-content" id="difficulty-content">
          <div className="difficulty-header">
            <div className="header-left">
              <button className="back-button" onClick={handleReturnToAssignment}>
                <FaChevronLeft />
              </button>
              
              <div className="assignment-title-section">
                <h2 className="assignment-title">Assignment Difficulty Analysis: {assignmentName.replace(/-/g, ' ')}</h2>
              </div>
            </div>
            
            <div className="assignment-actions">
              <button
                className="toggle-missing-stats-button"
                onClick={toggleMissingStats}
              >
                {showMissingStats ? 'Hide Statistics Editor' : 'Test Different Statistic Scores'}
              </button>
            </div>
          </div>

          {/* Inputs for all statistics (collapsible dropdown) */}
          {showMissingStats && Object.keys(missingStats).length > 0 && (
            <div className="missing-stats-dropdown">
              <h3 className="estimate-title">Estimate Statistics for this Assignment</h3>
              <h4 className="estimate-text">Test different scores here. Any changes you make will not be saved.</h4>
              {questions.map((q) => (
                <div key={q.id} className="question-item" id="difficulty-question-item">
                  {/* Render the question details using the QuestionItem component */}
                  <div style={{width:"75%"}}>
                  <QuestionItem question={q} />
                  </div>

                  {/* Statistics input fields */}
                  <div className="stat-estimate-div">
                    <h4 id="estimate-header">Estimate Statistics</h4>
                    <div className="stats-inputs">
                      <div className="stat-input">
                        <label>Mean:</label>
                        <input
                          type="number"
                          value={missingStats[q.id]?.mean || ''}
                          onChange={(e) => handleInputChange(q.id, 'mean', e.target.value)}
                        />
                      </div>
                      <div className="stat-input">
                        <label>Median:</label>
                        <input
                          type="number"
                          value={missingStats[q.id]?.median || ''}
                          onChange={(e) => handleInputChange(q.id, 'median', e.target.value)}
                        />
                      </div>
                      <div className="stat-input">
                        <label>Std Dev:</label>
                        <input
                          type="number"
                          value={missingStats[q.id]?.stdDev || ''}
                          onChange={(e) => handleInputChange(q.id, 'stdDev', e.target.value)}
                        />
                      </div>
                      <div className="stat-input">
                        <label>Min:</label>
                        <input
                          type="number"
                          value={missingStats[q.id]?.min || ''}
                          onChange={(e) => handleInputChange(q.id, 'min', e.target.value)}
                        />
                      </div>
                      <div className="stat-input">
                        <label>Max:</label>
                        <input
                          type="number"
                          value={missingStats[q.id]?.max || ''}
                          onChange={(e) => handleInputChange(q.id, 'max', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* New Metrics Section */}
            <div className="metrics-container" id="metrics-container-difficulty">
              <div className="metric">
                <strong>Number of Questions:</strong> {questions.length}
              </div>
              <div className="metric">
                <strong>Topics Covered:</strong> {getUniqueTagsCount()}
              </div>
              <div className="metric" id="last-metric">
                <strong> Difficulty Rating:</strong> {calculateAverageDifficulty()}
              </div>
            </div>

            {/* Overall Statistics */}
          <div className="overall-stats-div">
            <div className="overall-stats-container">
              <div className="overall-stat">
                <span><strong>Overall Mean: </strong></span>
                <span>{overallStats.mean}</span>
              </div>
              <div className="overall-stat">
                <span><strong>Overall Median: </strong></span>
                <span>{overallStats.median}</span>
              </div>
              <div className="overall-stat">
                <span><strong>Overall Std Dev: </strong></span>
                <span>{overallStats.stdDev}</span>
              </div>
              <div className="overall-stat">
                <span><strong>Min: </strong></span>
                <span>{overallStats.min}</span>
              </div>
              <div className="overall-stat">
                <span><strong>Max: </strong></span>
                <span>{overallStats.max}</span>
              </div>
            </div>

            {/* Bar Chart for Difficulty Distribution */}
            <div className="difficulty-chart">
              <h3>Difficulty Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={difficultyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="difficulty" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </MathJaxContext>
  );
}

export default AssignmentDifficultyPage;