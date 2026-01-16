import React from 'react';

const Home = ({ onStart }) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
      color: '#fff',
      textAlign: 'center'
    }}>
      <h1>Welcome to Study with Clankers</h1>
      <p>Discover educational content that matters</p>
      <button onClick={onStart} style={{
        marginTop: '20px',
        padding: '10px 20px',
        backgroundColor: '#6366f1',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
      }}>
        Start Exploring
      </button>
    </div>
  );
};

export default Home;