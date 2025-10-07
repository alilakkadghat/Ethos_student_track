// src/TimelineViewer.js
import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const TimelineViewer = () => {
  const [studentId, setStudentId] = useState('');
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!studentId) {
      setError('Please enter a Student ID.');
      return;
    }
    setLoading(true);
    setError('');
    setTimeline(null);
    try {
      const response = await axios.get(`${API_URL}/timelines/${studentId}`);
      setTimeline(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to fetch timeline for this ID.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="component-card">
      <h2>Entity Timeline Viewer</h2>
      <div className="search-bar">
        <input
          type="text"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder="Enter Student ID (e.g., S789)"
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <p className="status-message" style={{color: "var(--error-color)"}}>{error}</p>}
      
      {timeline && (
        <div>
          <div className="timeline-summary">
            <p>
              <strong>Summary for {timeline.student_id}:</strong> A total of{' '}
              {timeline.activities.length} activities recorded.
            </p>
          </div>
          <ul>
            {timeline.activities.map((activity, index) => (
              <li key={index} className="timeline-item">
                <p className="message">{activity.message}</p>
                <p className="meta">
                  📍 {activity.location} | 📅{' '}
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!timeline && !loading && !error && <p className="status-message">Enter a Student ID to view their activity timeline.</p>}
    </div>
  );
};

export default TimelineViewer;