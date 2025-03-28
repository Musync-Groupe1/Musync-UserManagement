const express = require('express');
const router = express.Router();
const db = require('../bdd.js');

// Fonction récup de donnees de maniere polymorphe 
const fetchData = async (res, userId, field,table) => {
    if (table === 'socialmedia'
    ){
        const [x] = await db.query(`SELECT ${field} FROM  ${table} WHERE social_media_id = ?`, [userId]);
        res.json(x.length ? x[0][field] : null);
    } else {
        const [rows] = await db.query(`SELECT ${field} FROM  ${table} WHERE user_id = ?`, [userId]);
        res.json(rows.length ? rows[0][field] : null);
    }
};

// Fonction récup de donnees de maniere polymorphe 
const updateField = async (res, userId, field, value, table) => {
    const [result] = await db.query(`UPDATE ${table} SET ${field} = ? WHERE user_id = ?`, [value, userId]);
    res.json({ message: result.affectedRows > 0 ? 'Profil mis à jour avec succès' : 'Erreur' });
};


// Fonction d ajout de donnees de maniere polymorphe 
const addField = async (res, field, value, table) => {
    const [result] = await db.query(`Insert ${table} SET ${field} = ? `, [value]);
    res.json({ message: result.affectedRows > 0 ? 'Profil mis à jour avec succès' : 'Erreur' });
};


// Fonction suppr de donnees de maniere polymorphe 
const deleteField = async (res, field, value, table) => {
    const [result] = await db.query(`Delete from ${table} where ${field} = ? `, [value]);
    res.json({ message: result.affectedRows > 0 ? 'Profil mis à jour avec succès' : 'Erreur' });
};

// GET Routes
router.get('/:id/private', (req, res) => fetchData(res, req.params.id, 'is_private','Profile'));
router.get('/:id/certified', (req, res) => fetchData(res, req.params.id, 'is_certified','Profile'));
router.get('/:id/description', (req, res) => fetchData(res, req.params.id, 'description','Profile'));
router.get('/:id/accepted-age-gap', (req, res) => fetchData(res, req.params.id, 'accepted_age_gap','Profile'));
router.get('/:id/accepted-distance', (req, res) => fetchData(res, req.params.id, 'accepted_distance','Profile'));
router.get('/:id/targeted-gender', (req, res) => fetchData(res, req.params.id, 'targeted_gender','Profile'));
router.get('/:id/favorite-musician', (req, res) => fetchData(res, req.params.id, 'favorite_musician','Profile'));
router.get('/:id/favorite-music', (req, res) => fetchData(res, req.params.id, 'favorite_music','Profile'));
router.get('/:id/favorite-style', (req, res) => fetchData(res, req.params.id, 'favorite_musical_style','Profile'));
router.get('/:id/user-id', (req, res) => fetchData(res, req.params.id, 'user_id','Profile'));
router.get('/:id/first-name', (req, res) => fetchData(res, req.params.id, 'first_name','User'));
router.get('/:id/last-name', (req, res) => fetchData(res, req.params.id, 'last_name' ,'User'));
router.get('/:id/email', (req, res) => fetchData(res, req.params.id, 'email','User'));
router.get('/:id/birthdate', (req, res) => fetchData(res, req.params.id, 'birthdate','User'));
router.get('/:id/gender', (req, res) => fetchData(res, req.params.id, 'gender' ,'User'));
router.get('/:id/social-media-name', (req, res) => fetchData(res, req.params.id, 'social_media_name' ,'socialmedia'));
router.get('/:id/social-media-private', (req, res) => fetchData(res, req.params.id, 'is_private' ,'usersocialmedia'));
router.get('/:id/token-account', (req, res) => fetchData(res, req.params.id, 'token_account' ,'usersocialmedia'));

// PUT Routes
router.put('/:id/private', (req, res) => updateField(res, req.params.id, 'is_private', req.body.is_private,'Profile'));
router.put('/:id/certified', (req, res) => updateField(res, req.params.id, 'is_certified', req.body.is_certified, 'Profile'));
router.put('/:id/description', (req, res) => updateField(res, req.params.id, 'description', req.body.description, 'Profile'));
router.put('/:id/accepted-age', (req, res) => updateField(res, req.params.id, 'accepted_age_gap', req.body.accepted_age_gap,'Profile'));
router.put('/:id/accepted-distance', (req, res) => updateField(res, req.params.id, 'accepted_distance', req.body.accepted_distance, 'Profile'));
router.put('/:id/targeted-gender', (req, res) => updateField(res, req.params.id, 'targeted_gender', req.body.targeted_gender, 'Profile'));
router.put('/:id/favorite-musician', (req, res) => updateField(res, req.params.id, 'favorite_musician', req.body.favorite_musician, 'Profile'));
router.put('/:id/favorite-music', (req, res) => updateField(res, req.params.id, 'favorite_music', req.body.favorite_music , 'Profile'));
router.put('/:id/favorite-style', (req, res) => updateField(res, req.params.id, 'favorite_musical_style', req.body.favorite_style, 'Profile'));
router.put('/:id/first-name', (req, res) => updateField(res, req.params.id, 'first_name', req.body.first_name , 'User'));
router.put('/:id/last-name', (req, res) => updateField(res, req.params.id,'last-name' ,req.body.last_name,'User'));
router.put('/:id/email', (req, res) => updateField(res, req.params.id,'email', req.body.email,'User'));
router.put('/:id/birthdate', (req, res) => updateField(res, req.params.id,'birthdate', req.body.birthdate,'User'));
router.put('/:id/gender', (req, res) => updateField(res, req.params.id,'gender', req.body.gender,'User'));
router.put('/:id/social-media-private', (req, res) => updateField(res, req.params.id,'is_private', req.body.is_private,'usersocialmedia'));
router.put('/:id/social-media-token', (req, res) => updateField(res, req.params.id,'token_account', req.body.token_account,'usersocialmedia'));


// POST Routes
router.post('/:id/social-media', (req, res) => addField(res,'social_media_name', req.body.social_media_name,'socialmedia'));

// Delete Routes
router.delete('/:id/social-media', (req, res) => deleteField(res,'social_media_name', req.body.social_media_name,'socialmedia'));


module.exports = router;
