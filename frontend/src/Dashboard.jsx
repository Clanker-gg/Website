import React from 'react';
import './Dashboard.css';

const Dashboard = ({ onBack }) => {
  return (
    <div className="dashboard-container">
      <div className="header-section">
        <h2 className="header">Learning Dashboard</h2>
        <h2 className="subheader">Current Classes</h2>
      </div>
      <div className="dashboard-card">
        <div className="card-header">
          <img src="/java-logo.png" alt="Java Logo" className="card-logo" />
          <h2>Java</h2>
        </div>
        <div className="card-subtitle">Master Java in 2 days</div>
        <p></p>
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{width: '65%'}}></div>
          </div>
          <div className="progress-percentage">65%</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;