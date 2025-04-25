const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { keycloak, memoryStore } = require('./keycloak');  // Assure-toi que Keycloak et memoryStore sont bien définis dans ton fichier keycloak.js
const profileController = require('./routes/ProfileController');

const app = express();
const port = 5000;

// Configuration CORS pour autoriser les requêtes cross-origin venant de ton frontend
app.use(cors({
  origin: 'http://localhost:3000',  // L'URL de ton frontend (React)
  credentials: true                // Autorise les cookies cross-origin
}));

// Middleware pour analyser les requêtes JSON
app.use(express.json());

// Configuration de la session
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore,              // Utilisation du memoryStore pour la session
  cookie: {
    sameSite: 'lax',               // Permet les cookies cross-origin lors des redirections
    secure: false                  // Utilise 'true' si tu es en HTTPS
  }
}));

// Initialisation du middleware Keycloak
app.use(keycloak.middleware());

// Définir les routes protégées par Keycloak sous '/api'
app.use('/api', keycloak.protect(), profileController);  // Toutes les routes sous '/api' seront protégées

// Callback pour Keycloak après l'authentification
app.get('/auth/callback', (req, res) => {
  console.log("✅ Callback Keycloak reçu, session : ", req.session);  // Affichage de la session après l'authentification

  // Redirige vers le frontend une fois la connexion réussie
  res.redirect('http://localhost:3000/profile');
});

// Démarrage du serveur sur le port 5000
app.listen(port, () => {
  console.log(`✅ Backend lancé sur http://localhost:${port}`);
});
