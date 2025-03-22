const express = require('express');
const router = express.Router();
const db = require('../bdd.js');

// Fonction utilitaire pour éviter les répétitions
const fetchField = async (res, userId, field) => {
    const [rows] = await db.query(`SELECT ${field} FROM Profile WHERE user_id = ?`, [userId]);
    res.json(rows.length ? rows[0][field] : null);
};

const updateField = async (res, userId, field, value) => {
    const [result] = await db.query(`UPDATE Profile SET ${field} = ? WHERE user_id = ?`, [value, userId]);
    res.json({ message: result.affectedRows > 0 ? 'Profil mis à jour avec succès' : 'Erreur' });
};

// GET Routes
router.get('/:id/private', (req, res) => fetchField(res, req.params.id, 'is_private'));
router.get('/:id/certified', (req, res) => fetchField(res, req.params.id, 'is_certified'));
router.get('/:id/description', (req, res) => fetchField(res, req.params.id, 'description'));
router.get('/:id/accepted-age-gap', (req, res) => fetchField(res, req.params.id, 'accepted_age_gap'));
router.get('/:id/accepted-distance', (req, res) => fetchField(res, req.params.id, 'accepted_distance'));
router.get('/:id/targeted-gender', (req, res) => fetchField(res, req.params.id, 'targeted_gender'));
router.get('/:id/favorite-musician', (req, res) => fetchField(res, req.params.id, 'favorite_musician'));
router.get('/:id/favorite-music', (req, res) => fetchField(res, req.params.id, 'favorite_music'));
router.get('/:id/favorite-style', (req, res) => fetchField(res, req.params.id, 'favorite_musical_style'));

// PUT Routes
router.put('/:id/private', (req, res) => updateField(res, req.params.id, 'is_private', req.body.isPrivate));
router.put('/:id/certified', (req, res) => updateField(res, req.params.id, 'is_certified', req.body.isCertified));
router.put('/:id/description', (req, res) => updateField(res, req.params.id, 'description', req.body.description));
router.put('/:id/accepted-age', (req, res) => updateField(res, req.params.id, 'accepted_age_gap', req.body.accepted_age_gap));
router.put('/:id/accepted-distance', (req, res) => updateField(res, req.params.id, 'accepted_distance', req.body.accepted_distance));
router.put('/:id/targeted-gender', (req, res) => updateField(res, req.params.id, 'targeted_gender', req.body.targeted_gender));
router.put('/:id/favorite-musician', (req, res) => updateField(res, req.params.id, 'favorite_musician', req.body.favorite_musician));
router.put('/:id/favorite-music', (req, res) => updateField(res, req.params.id, 'favorite_music', req.body.favorite_music));
router.put('/:id/favorite-style', (req, res) => updateField(res, req.params.id, 'favorite_musical_style', req.body.favorite_style));

module.exports = router;
