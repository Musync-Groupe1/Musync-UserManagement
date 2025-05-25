const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const { keycloak } = require('../keycloak');
const { notifyUserChange } = require('../utils/notifyUserChange');
const axios = require('axios');
require('dotenv').config();


const KEYCLOAK_BASE_URL = process.env.KEYCLOAK_BASE_URL || 'http://localhost:8181';
const REALM            = process.env.KEYCLOAK_REALM     || 'Musync';
const ADMIN_USERNAME   = process.env.KEYCLOAK_ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD   = process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin';
const CLIENT_ID        = process.env.KEYCLOAK_CLIENT_ID      || 'admin-cli';


async function getAdminToken() {
  const params = new URLSearchParams();
  params.append('grant_type', 'password');
  params.append('client_id', CLIENT_ID);
  params.append('username', ADMIN_USERNAME);
  params.append('password', ADMIN_PASSWORD);
  const response = await axios.post(`${KEYCLOAK_BASE_URL}/realms/master/protocol/openid-connect/token`, params);
  return response.data.access_token;
}

async function updateKeycloakUser(userId, updateData, adminToken) {
  // On filtre pour ne mettre à jour QUE les champs connus par Keycloak
  const allowedFields = ['email', 'firstName', 'lastName', 'username'];
  const keycloakUpdate = {};

  if (updateData.email)      keycloakUpdate.email      = updateData.email;
  if (updateData.first_name) keycloakUpdate.firstName  = updateData.first_name;
  if (updateData.last_name)  keycloakUpdate.lastName   = updateData.last_name;
  if (updateData.email)      keycloakUpdate.username   = updateData.email; // Username = email ici

  const url = `${KEYCLOAK_BASE_URL}/admin/realms/${REALM}/users/${userId}`;
  const config = {
    headers: { Authorization: `Bearer ${adminToken}` }
  };

  // PATCH aussi accepté par Keycloak, mais PUT fonctionne pour la plupart des cas
  const response = await axios.put(url, keycloakUpdate, config);

  // Keycloak retourne 204 si tout est OK
  if (response.status !== 204) {
    throw new Error('Echec update Keycloak : ' + response.status);
  }
}

async function deleteKeycloakUser(userId, adminToken) {
  const url = `${KEYCLOAK_BASE_URL}/admin/realms/${REALM}/users/${userId}`;
  const config = {
    headers: { Authorization: `Bearer ${adminToken}` }
  };
  // DELETE retourne 204 en cas de succès
  const response = await axios.delete(url, config);
  if (response.status !== 204) {
    throw new Error('Erreur lors de la suppression dans Keycloak : ' + response.status);
  }
}


async function createKeycloakUser(userData, adminToken) {
  const config = {
    headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
    validateStatus: () => true
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
  if (response.status !== 201) throw new Error(`Erreur création Keycloak : ${response.status}`);
  const location = response.headers.location;
  if (!location) throw new Error('Impossible de récupérer l’ID utilisateur Keycloak');
  return location.split('/').pop();
}




// GET (récupérer un user)
router.get('/user/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { user_id: req.params.id } });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    if (req.query.field) return res.json({ [req.query.field]: user[req.query.field] });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/user/:id', async (req, res) => {
  try {
    // Ne pas permettre la modification de l'id
    if ('user_id' in req.body) {
      return res.status(400).json({ error: 'Modification de user_id interdite.' });
    }

    // Pour éviter d'envoyer des champs vides/non pertinents à Keycloak
    const updateData = { ...req.body };

    // UPDATE Prisma
    const user = await prisma.user.update({
      where: { user_id: req.params.id },
      data: updateData
    });

    // UPDATE Keycloak (si first_name, last_name ou email changent)
    const fieldsForKeycloak = ['email', 'first_name', 'last_name'];
    const hasKeycloakUpdate = fieldsForKeycloak.some(f => f in req.body);

    if (hasKeycloakUpdate) {
      const adminToken = await getAdminToken();
      await updateKeycloakUser(req.params.id, updateData, adminToken);
    }

    await notifyUserChange('updated', req.params.id);

    res.json({ message: "Utilisateur mis à jour", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE (user + profile)
// DELETE (supprimer un profil lié à un user_id)
router.delete('/user/:id', async (req, res) => {
  try {
    // Supprimer de Keycloak d'abord
    const adminToken = await getAdminToken();
    await deleteKeycloakUser(req.params.id, adminToken);

    // Supprimer dans la base (user + profils liés)
    await prisma.$transaction([
      prisma.profile.deleteMany({ where: { user_id: req.params.id } }),
      prisma.user.delete({ where: { user_id: req.params.id } })
    ]);

    await notifyUserChange('deleted', req.params.id);
    res.json({ message: "Utilisateur et profil supprimés" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// POST (create user + profile)
router.post('/create-user', async (req, res) => {
  const {
    first_name, last_name, email, birthdate, gender, password,
    is_private, is_certified, description, accepted_age_gap, accepted_distance,
    targeted_gender, favorite_musician, favorite_music, favorite_musical_style
  } = req.body;

  // Validation simple
  if (!first_name || !last_name || !email || !birthdate || !gender || !password) {
    return res.status(400).json({ error: 'Tous les champs obligatoires doivent être fournis' });
  }

  // Conversion birthdate en objet Date (obligatoire pour Prisma)
  let birthdateObj;
  try {
    birthdateObj = typeof birthdate === 'string' ? new Date(birthdate) : birthdate;
    if (!(birthdateObj instanceof Date) || isNaN(birthdateObj.getTime())) {
      throw new Error('Date de naissance invalide');
    }
  } catch {
    return res.status(400).json({ error: 'Date de naissance invalide (format attendu YYYY-MM-DD)' });
  }

  // Vérification de l'enum gender
  const validGenders = ['Male', 'Female', 'Other'];
  if (!validGenders.includes(gender)) {
    return res.status(400).json({ error: 'Genre invalide (attendu: Male, Female, Other)' });
  }

  try {
    const adminToken = await getAdminToken();
    const keycloakUserId = await createKeycloakUser(
      { first_name, last_name, email, password },
      adminToken
    );

    // Transaction création user + profile
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          user_id: keycloakUserId,
          first_name,
          last_name,
          email,
          birthdate: birthdateObj, // ENVOI D'UN OBJET DATE !
          gender
        }
      });
      const profile = await tx.profile.create({
        data: {
          user_id: keycloakUserId,
          is_private,
          is_certified,
          description,
          accepted_age_gap,
          accepted_distance,
          targeted_gender,
          favorite_musician,
          favorite_music,
          favorite_musical_style
        }
      });
      return { user, profile };
    });

    await notifyUserChange('created', keycloakUserId);

    res.status(201).json({
      message: 'Utilisateur et profil créés avec succès',
      user_id: keycloakUserId,
      user: result.user,
      profile: result.profile
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erreur serveur lors de la création',
      details: error.message
    });
  }
});


module.exports = router;
