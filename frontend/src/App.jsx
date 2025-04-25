// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Profile from './Profile';

function App() {
  const loginUrl = "http://localhost:8181/realms/Musync/protocol/openid-connect/auth?client_id=Musync-client&response_type=code&scope=openid&redirect_uri=http://localhost:5000/auth/callback";

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div style={{ textAlign: 'center', marginTop: '20vh' }}>
            <h1>Bienvenue sur Musync 🎵</h1>
            <a href={loginUrl}>
              <button>Se connecter / S'inscrire</button>
            </a>
          </div>
        } />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
