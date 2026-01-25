import React from 'react';
import './Dashboard.css';
import ClassCard from './components/ClassCard';

const classes = [
  {
    id: 'java',
    title: 'Java',
    logo: '/java-logo.png',
    subtitle: 'Master Java in 2 days',
    progress: 20,
  },
  {
    id: 'apwh',
    title: 'AP World History',
    logo: '/apwh-logo.png',
    subtitle: 'Get a 5 for the AP Exam',
    progress: 45,
  }
  // Add more class objects here to render additional cards
];

const Dashboard = ({ onBack }) => {
  return (
    <div className="dashboard-container">
      <div className="header-section">
        <h2 className="header">Learning Dashboard</h2>
        <h2 className="subheader">Current Classes</h2>
      </div>

      <div className="cards-grid">
        {classes.map((c) => (
          <ClassCard key={c.id} title={c.title} logo={c.logo} subtitle={c.subtitle} progress={c.progress} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;