const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const { keycloak } = require('../keycloak');
const { notifyUserChange } = require('../utils/notifyUserChange');


router.use(keycloak.protect());

// GET (récupérer un profil)
router.get('/:id', async (req, res) => {
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
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
  try {
    await prisma.profile.delete({ where: { user_id: req.params.id } });
    await notifyUserChange('delete', req.params.id);
    res.json({ message: "Profil supprimé" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
