import React, { useState } from 'react';
import Home from './Home';
import StudyWithClankers from './StudyWithClankers';
import './StudyWithClankers.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home'); // homepage

  return (
    <div>
      {currentPage === 'home' ? (
        <Home onStart={() => setCurrentPage('study')} />
      ) : (
        <StudyWithClankers onBack={() => setCurrentPage('home')} />
      )}
    </div>
  );
}

export default App;