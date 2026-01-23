import React, { useState } from 'react';
import Home from './Home';
import StudyWithClankers from './StudyWithClankers';
import Dashboard from './Dashboard'; //
import './StudyWithClankers.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home'); // homepage

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onStart={() => setCurrentPage('study')} onLogin={() => setCurrentPage('dashboard')} />;
      case 'study':
        return <StudyWithClankers onBack={() => setCurrentPage('home')} />;
      case 'dashboard':
        return <Dashboard onBack={() => setCurrentPage('home')} />; //THERE IS NO LOGIN PAGE, ill change this when everything else works
      default:
        return <Home onStart={() => setCurrentPage('study')} onLogin={() => setCurrentPage('dashboard')} />;
    }
  };

  return (
    <div>
      {renderPage()}
    </div>
  );
}

export default App;