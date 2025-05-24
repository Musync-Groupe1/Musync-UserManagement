const express = require('express');
const router = express.Router();
const db = require('../bdd.js');
const axios = require('axios'); // Pour appels HTTP Keycloak
const { keycloak } = require('../keycloak');
const { sendMessage } = require('../../kafkaounet/producer.js');

router.use(keycloak.protect());
console.log('✅ ProfileController chargé');

const KEYCLOAK_BASE_URL = 'http://localhost:8181'; // Adapte selon ta config
const REALM = 'Musync'; // Realm Keycloak
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin';
const CLIENT_ID = 'admin-cli';

// Obtenir token admin Keycloak
async function getAdminToken() {
  const params = new URLSearchParams();
  params.append('grant_type', 'password');
  params.append('client_id', CLIENT_ID);
  params.append('username', ADMIN_USERNAME);
  params.append('password', ADMIN_PASSWORD);

  const response = await axios.post(`${KEYCLOAK_BASE_URL}/realms/master/protocol/openid-connect/token`, params);
  return response.data.access_token;
}

// Créer utilisateur dans Keycloak via API Admin
// Créer utilisateur dans Keycloak via API Admin et récupérer son ID
async function createKeycloakUser(userData, adminToken) {
  const config = {
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    validateStatus: () => true // pour gérer manuellement le status
  };

  const payload = {
    username: userData.email,
    email: userData.email,
    enabled: true,
    firstName: userData.first_name,
    lastName: userData.last_name,
    credentials: [{
      type: 'password',
      value: userData.password,
      temporary: true
    }]
  };

  const url = `${KEYCLOAK_BASE_URL}/admin/realms/${REALM}/users`;
  const response = await axios.post(url, payload, config);

  if (response.status !== 201) {
    throw new Error(`Erreur création Keycloak : ${response.status} - ${JSON.stringify(response.data)}`);
  }

  // L’ID du nouvel utilisateur est dans l’en-tête Location
  const location = response.headers.location; // ex: http://localhost:8181/admin/realms/Musync/users/{id}
  if (!location) {
    throw new Error('Impossible de récupérer l’ID utilisateur Keycloak');
  }

  const parts = location.split('/');
  const keycloakUserId = parts[parts.length - 1];
  return keycloakUserId;
}

// Notification Kafka complète
async function notifyUserChange(action, userId) {
  try {
    const [[user]] = await db.query(`
      SELECT user_id, first_name, last_name, email, birthdate, gender 
      FROM User WHERE user_id = ?`, [userId]);
    if (!user) throw new Error('Utilisateur non trouvé');

    const [[profile]] = await db.query(`
      SELECT profile_id, is_private, is_certified, description, accepted_age_gap, accepted_distance,
             targeted_gender, favorite_musician, favorite_music, favorite_musical_style
      FROM Profile WHERE user_id = ?`, [userId]);

    const [[profilePicture]] = await db.query(`
      SELECT picture_id, link, name, posted_date 
      FROM Picture WHERE picture_id = ? `, [profile?.profile_id || null]);

    const [pictures] = await db.query(`
      SELECT picture_id, link, name, posted_date 
      FROM Picture WHERE picture_id = ?`, [profile?.profile_id || null]);

    const [socialMedia] = await db.query(`
      SELECT us.social_media_id, sm.social_media_name, us.token_account, us.is_private
      FROM usersocialmedia us
      JOIN socialmedia sm ON us.social_media_id = sm.social_media_id
      WHERE us.user_id = ?`, [userId]);

const message = {
  action,
  user,
  profile_id: profile?.profile_id || null,
  profile_picture: profilePicture || null,
  pictures: pictures || [],
  is_private: profile?.is_private || false,
  is_certified: profile?.is_certified || false,
  description: profile?.description || '',
  accepted_age_gap: profile?.accepted_age_gap || 0,
  accepted_distance: profile?.accepted_distance || 0,
  targeted_gender: profile?.targeted_gender || '',
  favorite_musician: profile?.favorite_musician || '',
  favorite_music: profile?.favorite_music || '',
  favorite_musical_style: profile?.favorite_musical_style || '',
  social_media: socialMedia || [],
  timestamp: new Date().toISOString(),
};

await sendMessage('user-changes', message);
console.log(`Notification Kafka envoyée pour action ${action} utilisateur ID=${userId} message=${JSON.stringify(message, null, 2)}`);

  } catch (error) {
    console.error('Erreur dans notifyUserChange:', error);
  }
}

// Fonctions auxiliaires
const fetchData = async (res, userId, field, table) => {
  if (table === 'socialmedia') {
    const [x] = await db.query(`SELECT ${field} FROM  ${table} WHERE social_media_id = ?`, [userId]);
    res.json(x.length ? x[0][field] : null);
  } else {
    const [rows] = await db.query(`SELECT ${field} FROM  ${table} WHERE user_id = ?`, [userId]);
    res.json(rows.length ? (field === '*' ? rows : rows[0][field]) : null);
  }
};

const fetchSocialMedia = async (res, userId, socialMediaId, field, table) => {
  const [x] = await db.query(`SELECT ${field} FROM  ${table} WHERE social_media_id = ? and user_id = ?`, [socialMediaId, userId]);
  res.json(x.length ? x[0][field] : null);
};

const updateField = async (res, userId, field, value, table) => {
  try {
    const [result] = await db.query(`UPDATE ${table} SET ${field} = ? WHERE user_id = ?`, [value, userId]);
    if (result.affectedRows > 0) {
      await notifyUserChange('update', userId);
      res.json({ message: 'Profil mis à jour avec succès' });
    } else {
      res.json({ message: 'Erreur' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const addField = async (res, userId, socialMediaId, socialToken, table) => {
  try {
    const [result] = await db.query(`INSERT INTO ${table} VALUES(?,?,?,0)`, [userId, socialMediaId, socialToken]);
    if (result.affectedRows > 0) {
      await notifyUserChange('create', userId);
      res.json({ message: 'Profil mis à jour avec succès' });
    } else {
      res.json({ message: 'Erreur' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const deleteField = async (res, userId, socialMediaId, table) => {
  try {
    await notifyUserChange('delete', userId);
    const [result] = await db.query(`DELETE FROM ${table} WHERE user_id = ? AND social_media_id = ?`, [userId, socialMediaId]);
    if (result.affectedRows > 0) {
      res.json({ message: 'Profil supprimé avec succès' });
    } else {
      res.json({ message: 'Erreur' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Routes GET
router.get('/:id/private', (req, res) => fetchData(res, req.params.id, 'is_private', 'Profile'));
router.get('/:id/certified', (req, res) => fetchData(res, req.params.id, 'is_certified', 'Profile'));
router.get('/:id/description', (req, res) => fetchData(res, req.params.id, 'description', 'Profile'));
router.get('/:id/accepted-age-gap', (req, res) => fetchData(res, req.params.id, 'accepted_age_gap', 'Profile'));
router.get('/:id/accepted-distance', (req, res) => fetchData(res, req.params.id, 'accepted_distance', 'Profile'));
router.get('/:id/targeted-gender', (req, res) => fetchData(res, req.params.id, 'targeted_gender', 'Profile'));
router.get('/:id/favorite-musician', (req, res) => fetchData(res, req.params.id, 'favorite_musician', 'Profile'));
router.get('/:id/favorite-music', (req, res) => fetchData(res, req.params.id, 'favorite_music', 'Profile'));
router.get('/:id/favorite-style', (req, res) => fetchData(res, req.params.id, 'favorite_musical_style', 'Profile'));
router.get('/:id/user-id', (req, res) => fetchData(res, req.params.id, 'user_id', 'Profile'));
router.get('/:id/first-name', (req, res) => fetchData(res, req.params.id, 'first_name', 'User'));
router.get('/:id/last-name', (req, res) => fetchData(res, req.params.id, 'last_name', 'User'));
router.get('/:id/email', (req, res) => fetchData(res, req.params.id, 'email', 'User'));
router.get('/:id/birthdate', (req, res) => fetchData(res, req.params.id, 'birthdate', 'User'));
router.get('/:id/gender', (req, res) => fetchData(res, req.params.id, 'gender', 'User'));

router.get('/:id/social-media', (req, res) => fetchData(res, req.params.id, '*', 'usersocialmedia'));

router.get('/:id/:mediaId/social-media-private', (req, res) => fetchSocialMedia(res, req.params.id, req.params.mediaId, 'is_private', 'usersocialmedia'));
router.get('/:id/:mediaId/token-account', (req, res) => fetchSocialMedia(res, req.params.id, req.params.mediaId, 'token_account', 'usersocialmedia'));
router.get('/:mediaId/social-media-name', (req, res) => fetchData(res, req.params.mediaId, 'social_media_name', 'socialmedia'));

// Routes PUT
router.put('/:id/private', (req, res) => updateField(res, req.params.id, 'is_private', req.body.is_private, 'Profile'));
router.put('/:id/certified', (req, res) => updateField(res, req.params.id, 'is_certified', req.body.is_certified, 'Profile'));
router.put('/:id/description', (req, res) => updateField(res, req.params.id, 'description', req.body.description, 'Profile'));
router.put('/:id/accepted-age', (req, res) => updateField(res, req.params.id, 'accepted_age_gap', req.body.accepted_age_gap, 'Profile'));
router.put('/:id/accepted-distance', (req, res) => updateField(res, req.params.id, 'accepted_distance', req.body.accepted_distance, 'Profile'));
router.put('/:id/targeted-gender', (req, res) => updateField(res, req.params.id, 'targeted_gender', req.body.targeted_gender, 'Profile'));
router.put('/:id/favorite-musician', (req, res) => updateField(res, req.params.id, 'favorite_musician', req.body.favorite_musician, 'Profile'));
router.put('/:id/favorite-music', (req, res) => updateField(res, req.params.id, 'favorite_music', req.body.favorite_music, 'Profile'));
router.put('/:id/favorite-style', (req, res) => updateField(res, req.params.id, 'favorite_musical_style', req.body.favorite_style, 'Profile'));
router.put('/:id/first-name', (req, res) => updateField(res, req.params.id, 'first_name', req.body.first_name, 'User'));
router.put('/:id/last-name', (req, res) => updateField(res, req.params.id, 'last-name', req.body.last_name, 'User'));
router.put('/:id/email', (req, res) => updateField(res, req.params.id, 'email', req.body.email, 'User'));
router.put('/:id/birthdate', (req, res) => updateField(res, req.params.id, 'birthdate', req.body.birthdate, 'User'));
router.put('/:id/gender', (req, res) => updateField(res, req.params.id, 'gender', req.body.gender, 'User'));

router.put('/:id/:mediaId/social-media-private', (req, res) => updateSocialField(res, req.params.id, req.params.mediaId, 'is_private', req.body.is_private, 'usersocialmedia'));
router.put('/:id/:mediaId/social-media-token', (req, res) => updateSocialField(res, req.params.id, req.params.mediaId, 'token_account', req.body.token_account, 'usersocialmedia'));

// Routes POST
router.post('/:id/:mediaId/:mediaToken/social-media', (req, res) => addField(res, req.params.id, req.params.mediaId, req.params.mediaToken, 'usersocialmedia'));

// Route pour envoyer un message Kafka arbitraire (optionnel)
router.post('/send-message', async (req, res) => {
  try {
    const { topic, message } = req.body;

    if (!topic || !message) {
      return res.status(400).json({ error: 'topic et message sont requis' });
    }

    await sendMessage(topic, message);

    res.json({ message: 'Message envoyé avec succès au topic ' + topic });
  } catch (error) {
    console.error('Erreur lors de l’envoi du message Kafka:', error);
    res.status(500).json({ error: 'Erreur serveur lors de l’envoi du message' });
  }
});

// Route POST pour créer un nouvel utilisateur (BDD + Keycloak)
router.post('/create-user', async (req, res) => {
  const {
    first_name, last_name, email, birthdate, gender, description,
    is_private, is_certified, accepted_age_gap, accepted_distance,
    targeted_gender, favorite_musician, favorite_music,
    favorite_musical_style, password
  } = req.body;

  if (!first_name || !last_name || !email || !birthdate || !gender || !password) {
    return res.status(400).json({ error: 'Tous les champs obligatoires doivent être fournis, y compris le mot de passe' });
  }

  try {
    // Obtenir token admin Keycloak
    const adminToken = await getAdminToken();

    // Créer utilisateur Keycloak
  const keycloakUserId = await createKeycloakUser({ first_name, last_name, email, password }, adminToken);

// Insérer dans base locale avec l'ID Keycloak
const [userResult] = await db.query(`
  INSERT INTO User (user_id, first_name, last_name, email, birthdate, gender)
  VALUES (?, ?, ?, ?, ?, ?)`, [keycloakUserId, first_name, last_name, email, birthdate, gender]);
const userId = keycloakUserId; // on conserve l'ID Keycloak partout


    // Créer profil
    const [profileResult] = await db.query(`
      INSERT INTO Profile (user_id, is_private, is_certified, description, accepted_age_gap, accepted_distance, targeted_gender, favorite_musician, favorite_music, favorite_musical_style)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, is_private, is_certified, description, accepted_age_gap, accepted_distance, targeted_gender, favorite_musician, favorite_music, favorite_musical_style]
    );
    const profileId = profileResult.insertId;

    // Photo profil par défaut
    const postedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await db.query(`
      INSERT INTO Picture (picture_id, link, name, posted_date)
      VALUES (?, ?, ?, ?)`, [profileId, '', 'Default Profile Picture', postedDate]);

    // Notification Kafka
    await notifyUserChange('create', userId);

    res.status(201).json({
      message: 'Utilisateur créé avec succès dans BDD et Keycloak',
      user_id: userId,
      profile_id: profileId
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Erreur serveur lors de la création de l\'utilisateur' });
  }
});

// Routes DELETE
router.delete('/:id/:mediaId/social-media', (req, res) => deleteField(res, req.params.id, req.params.mediaId, 'usersocialmedia'));

module.exports = router;
