// src/App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import LogCreator from './LogCreator';
import TimelineViewer from './TimelineViewer';
import AlertsDashboard from './AlertsDashboard';

const API_URL = 'http://localhost:5001/api';

function App() {
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoadingAlerts(true);
      try {
        const response = await axios.get(`${API_URL}/alerts`);
        setAlerts(response.data);
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      } finally {
        setLoadingAlerts(false);
      }
    };

    fetchAlerts();
    // Refresh alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [refreshKey]);

  const handleLogCreated = () => {
    // Trigger a refresh of alerts when a new log is created
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <div className="App">
      <header>
        <h1>Campus Security & Entity Resolution Dashboard</h1>
      </header>
      <div className="main-container">
        <AlertsDashboard alerts={alerts} loading={loadingAlerts} />
        <TimelineViewer />
        <LogCreator onLogCreated={handleLogCreated} />
      </div>
    </div>
  );
}

export default App;