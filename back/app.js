const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { keycloak, memoryStore } = require('./keycloak');
const profileController = require('./routes/ProfileController');
const userController = require('./routes/UserController');
const { startProducer, sendMessage } = require('../kafkaounet/producer.js');
const { startConsumer } = require('../kafkaounet/consumer.js');

const app = express();
const port = 5000;

// CORS simple
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Headers généraux
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.json());

// Session express + store mémoire (nécessaire pour Keycloak)
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore,
  cookie: { sameSite: 'none', secure: false }, // adapte secure en prod
}));

// Middleware Keycloak
app.use(keycloak.middleware());

// Middleware personnalisé pour renvoyer 401 si non authentifié
function requireAuth(req, res, next) {
  if (!req.kauth || !req.kauth.grant) {
    return res.status(401).json({ message: 'Non authentifié' });
  }
  next();
}

// Routes protégées avec Keycloak checkSso + requireAuth
app.use('/api/profile', keycloak.checkSso(), requireAuth, profileController);
app.use('/api/user', userController)
// Callback Keycloak (exemple)
app.get('/auth/callback', (req, res) => {
  console.log("🔁 Callback reçu avec code :", req.query.code);
  res.redirect('http://localhost:5000/profile');
});

// Fonction pour démarrer Kafka (producteur + consommateur)
async function startKafka() {
  try {
    await startProducer();
    console.log('Producteur Kafka démarré');

    await startConsumer('mon-topic', async (data) => {
      console.log('Message Kafka reçu:', data);
      // Traite ici les messages reçus
    });

    console.log('Consommateur Kafka démarré et abonné au topic "mon-topic"');
  } catch (error) {
    console.error('Erreur lors du démarrage Kafka:', error);
    process.exit(1);
  }
}

// Démarre Kafka puis lance le serveur Express
startKafka().then(() => {
  app.listen(port, () => {
    console.log(`Backend lancé sur http://localhost:${port}`);
  });
});
