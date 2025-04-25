// frontend/src/Home.jsx
import React, { useEffect } from 'react';

function Home() {
  const loginUrl = "http://localhost:8181/realms/Musync/protocol/openid-connect/auth?client_id=Musync-client&response_type=code&scope=openid&redirect_uri=http://localhost:5000/auth/callback";


  return (
    <div style={{ textAlign: 'center', marginTop: '20vh' }}>
      <h1>Bienvenue sur Musync 🎵</h1>
      <a href={loginUrl}>
        <button>Se connecter / S'inscrire</button>
      </a>
    </div>
  );
}

export default Home;
