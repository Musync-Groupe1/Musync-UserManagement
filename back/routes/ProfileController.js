const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const { keycloak } = require('../keycloak');
const { notifyUserChange } = require('../utils/notifyUserChange');


router.use(keycloak.protect());

// GET (récupérer un profil)
router.get('/profile/:id', async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { user_id: req.params.id } });
    if (!profile) return res.status(404).json({ message: "Profil non trouvé" });
    if (req.query.field) return res.json({ [req.query.field]: profile[req.query.field] });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT (update profile)
router.put('/profile/:id', async (req, res) => {
  try {
    const data = req.body;
    const profile = await prisma.profile.update({ where: { user_id: req.params.id }, data });
    await notifyUserChange('update', req.params.id);
    res.json({ message: "Profil mis à jour", profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE (supprimer un profil)
router.delete('/profiel/:id', async (req, res) => {
  try {
    await prisma.profile.delete({ where: { user_id: req.params.id } });
    await notifyUserChange('delete', req.params.id);
    res.json({ message: "Profil supprimé" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST (créer un profil lié à un user existant)
// router.post('/', async (req, res) => {
//   const {
//     user_id, is_private, is_certified, description,
//     accepted_age_gap, accepted_distance, targeted_gender,
//     favorite_musician, favorite_music, favorite_musical_style
//   } = req.body;

//   if (!user_id) return res.status(400).json({ error: 'user_id est requis' });

//   try {
//     const profile = await prisma.profile.create({
//       data: {
//         user_id, is_private, is_certified, description,
//         accepted_age_gap, accepted_distance, targeted_gender,
//         favorite_musician, favorite_music, favorite_musical_style
//       }
//     });
//     await notifyUserChange('create', user_id);

//     res.status(201).json({
//       message: 'Profil créé avec succès',
//       profile
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Erreur serveur lors de la création', details: error.message });
//   }
// });

module.exports = router;
