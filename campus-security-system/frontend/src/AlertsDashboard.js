// src/AlertsDashboard.js
import React from 'react';

const AlertsDashboard = ({ alerts, loading }) => {
  return (
    <div className="component-card">
      <h2>Active Security Alerts</h2>
      {loading && <p className="status-message">Loading alerts...</p>}
      {!loading && alerts.length === 0 && (
        <p className="status-message">No active alerts. System is clear.</p>
      )}
      {alerts.length > 0 && (
        <ul>
          {alerts.map((alert, index) => (
            <li key={index} className="alert-item">
              <p className="message">{alert.message}</p>
              <p className="meta">
                🔔 Alert generated on:{' '}
                {new Date(alert.timestamp).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AlertsDashboard;