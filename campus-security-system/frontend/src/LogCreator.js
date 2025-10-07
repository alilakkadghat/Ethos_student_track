// src/LogCreator.js
import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const LogCreator = ({ onLogCreated }) => {
  const [formData, setFormData] = useState({
    entity_id: '',
    name: '',
    source: 'Library Door',
    activity: 'Entry Swipe',
    location: 'Main Library',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.source || !formData.activity || !formData.location) {
      alert('Source, Activity, and Location are required.');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/logs`, formData);
      alert(`Log submitted successfully! Message: ${response.data.message}`);
      onLogCreated(); // Notify parent component
      // Clear form for next entry
      setFormData({
        entity_id: '',
        name: '',
        source: 'Library Door',
        activity: 'Entry Swipe',
        location: 'Main Library',
      });
    } catch (error) {
      console.error('Error submitting log:', error);
      alert('Failed to submit log. See console for details.');
    }
  };

  return (
    <div className="component-card">
      <h2>Simulate New Event Log</h2>
      <form onSubmit={handleSubmit} className="log-form">
        <div className="form-group">
          <label>Entity ID (e.g., Card ID, Device Hash)</label>
          <input
            type="text"
            name="entity_id"
            value={formData.entity_id}
            onChange={handleChange}
            placeholder="e.g., C12345"
          />
        </div>
        <div className="form-group">
          <label>Name (for fuzzy matching)</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., John Doe"
          />
        </div>
        <div className="form-group">
          <label>Source</label>
          <input
            type="text"
            name="source"
            value={formData.source}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Activity</label>
          <input
            type="text"
            name="activity"
            value={formData.activity}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Submit Log</button>
      </form>
    </div>
  );
};

export default LogCreator;