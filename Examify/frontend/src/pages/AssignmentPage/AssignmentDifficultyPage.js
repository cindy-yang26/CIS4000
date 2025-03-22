import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { fetchAssignmentQuestions } from '../../api/assignments';

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

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const fetchedQuestions = await fetchAssignmentQuestions(assignmentId, navigate);
        setQuestions(fetchedQuestions);

        // Initialize missingStats for questions with missing or incomplete stats
        const initialMissingStats = {};
        fetchedQuestions.forEach((q) => {
          if (!q.stats || Object.keys(q.stats).length === 0) {
            // Initialize missing stats with empty values
            initialMissingStats[q.id] = { mean: '', median: '', stdDev: '', min: '', max: '' };
          } else {
            // Check for incomplete stats and initialize missing fields
            const stats = q.stats;
            initialMissingStats[q.id] = {
              mean: stats.mean === undefined || stats.mean === null ? '' : stats.mean,
              median: stats.median === undefined || stats.median === null ? '' : stats.median,
              stdDev: stats.stdDev === undefined || stats.stdDev === null ? '' : stats.stdDev,
              min: stats.min === undefined || stats.min === null ? '' : stats.min,
              max: stats.max === undefined || stats.max === null ? '' : stats.max,
            };
          }
        });

        setMissingStats(initialMissingStats);
      } catch (error) {
        alert('Failed to load questions.');
        console.error(error);
      }
    };

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
      const stats = missingStats[q.id] || q.stats;
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

  return (
    <div className="assignment-difficulty-page">
      <Header />
      <div className="difficulty-content">
        <h2>Assignment Difficulty Analysis</h2>
        <p>Overall statistics for all questions in Assignment {assignmentId}.</p>

        {/* Button to toggle missing stats dropdown */}
        <button onClick={toggleMissingStats} className="toggle-missing-stats-button">
          {showMissingStats ? 'Hide Missing Stats' : 'Show Missing Stats'}
        </button>

        {/* Inputs for missing statistics (collapsible dropdown) */}
        {showMissingStats && Object.keys(missingStats).length > 0 && (
          <div className="missing-stats-dropdown">
            <h3>Estimate Missing Statistics</h3>
            {Object.entries(missingStats).map(([questionId, stats]) => (
              <div key={questionId} className="missing-stat-entry">
                <h4>Question ID: {questionId}</h4>
                <input
                  type="number"
                  placeholder="Mean"
                  value={stats.mean}
                  onChange={(e) => handleInputChange(questionId, 'mean', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Median"
                  value={stats.median}
                  onChange={(e) => handleInputChange(questionId, 'median', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Std Dev"
                  value={stats.stdDev}
                  onChange={(e) => handleInputChange(questionId, 'stdDev', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Min"
                  value={stats.min}
                  onChange={(e) => handleInputChange(questionId, 'min', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={stats.max}
                  onChange={(e) => handleInputChange(questionId, 'max', e.target.value)}
                />
              </div>
            ))}
            <button onClick={calculateOverallStats}>Update Overall Stats</button>
          </div>
        )}

        {/* Overall Statistics */}
        <ul>
          <li>
            <strong>Total Mean:</strong> {overallStats.mean}
          </li>
          <li>
            <strong>Total Median:</strong> {overallStats.median}
          </li>
          <li>
            <strong>Total Std Dev:</strong> {overallStats.stdDev}
          </li>
          <li>
            <strong>Total Min:</strong> {overallStats.min}
          </li>
          <li>
            <strong>Total Max:</strong> {overallStats.max}
          </li>
        </ul>

        <button onClick={() => navigate(`/course/${courseId}/assignment/${assignmentId}`)}>
          Back to Assignment
        </button>
      </div>
    </div>
  );
}

export default AssignmentDifficultyPage;