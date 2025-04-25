const express = require('express');
const router = express.Router();
const db = require('../bdd.js');
const { keycloak } = require('../keycloak');

// 🔒 Middleware global pour toutes les routes de ce fichier
router.use(keycloak.protect());
console.log('✅ ProfileController chargé');

router.get('/auth/callback', (req, res) => {
    // Normalement, Keycloak middleware va gérer le code automatiquement
    // Si tout s’est bien passé, tu peux rediriger manuellement vers le frontend
    res.redirect('http://localhost:3000/profile');
  });


/*   const cors = require('cors');

// Activer CORS pour toutes les origines (à adapter si nécessaire)
app.use(cors({
    origin: 'http://localhost:3000', // URL de ton frontend React
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
})); */

  
// Fonction récup de donnees de maniere polymorphe 
const fetchData = async (res, userId, field,table) => {
    console.log('🔥 Route certified atteinte');
    if (table === 'socialmedia'
    ){
        const [x] = await db.query(`SELECT ${field} FROM  ${table} WHERE social_media_id = ?`, [userId]);
        res.json(x.length ? x[0][field] : null);
    } else {
        const [rows] = await db.query(`SELECT ${field} FROM  ${table} WHERE user_id = ?`, [userId]);
        res.json(rows.length ?  field == '*' ? rows :  rows[0][field] : null);
        
    }

};
const fetchSocialMedia = async (res, userId, socialMediaId, field,table) => {
        const [x] = await db.query(`SELECT ${field} FROM  ${table} WHERE social_media_id = ? and user_id = ?`, [socialMediaId,userId]);
        res.json(x.length ? x[0][field] : null);

};
// Fonction récup de donnees de maniere polymorphe 
const updateField = async (res, userId, field, value, table) => {
    const [result] = await db.query(`UPDATE ${table} SET ${field} = ? WHERE user_id = ?`, [value, userId]);
    res.json({ message: result.affectedRows > 0 ? 'Profil mis à jour avec succès' : 'Erreur' });
};

const updateSocialField = async (res, userId,socialMediaId, field, value, table) => {
    const [result] = await db.query(`UPDATE ${table} SET ${field} = ? WHERE user_id = ? and social_media_id = ?`, [value, userId,socialMediaId]);
    res.json({ message: result.affectedRows > 0 ? 'Profil mis à jour avec succès' : 'Erreur' });
};




// Fonction d ajout de donnees  
const addField = async (res, userId,socialMediaId, socialToken, table) => {
    const [result] = await db.query(`Insert into ${table} values(?,?,?,0)`, [ userId, socialMediaId,socialToken]);
    res.json({ message: result.affectedRows > 0 ? 'Profil mis à jour avec succès' : 'Erreur' });
};


// Fonction suppr de donnees  
const deleteField = async (res, userId, socialMediaId, table) => {
    const [result] = await db.query(`Delete from ${table} where user_id = ? and social_media_id = ? `, [userId,socialMediaId]);
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

router.get('/:id/social-media', (req, res) => fetchData(res, req.params.id, '*' ,'usersocialmedia'));




router.get('/:id/:mediaId/social-media-private', (req, res) => fetchSocialMedia(res, req.params.id, req.params.mediaId, 'is_private' ,'usersocialmedia'));
router.get('/:id/:mediaId/token-account', (req, res) => fetchSocialMedia(res, req.params.id, req.params.mediaId, 'token_account' ,'usersocialmedia'));
router.get('/:mediaId/social-media-name', (req, res) => fetchData(res,  req.params.mediaId, 'social_media_name' ,'socialmedia'));




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





router.put('/:id/:mediaId/social-media-private', (req, res) => updateSocialField(res, req.params.id,req.params.mediaId,'is_private', req.body.is_private,'usersocialmedia'));
router.put('/:id/:mediaId/social-media-token', (req, res) => updateSocialField(res, req.params.id,req.params.mediaId,'token_account', req.body.token_account,'usersocialmedia'));


// POST Routes
router.post('/:id/:mediaId/:mediaToken/social-media', (req, res) => addField(res, req.params.id,req.params.mediaId,req.params.mediaToken,'usersocialmedia'));

// Delete Routes
router.delete('/:id/:mediaId/social-media', (req, res) => deleteField(res,req.params.id, req.params.mediaId,'usersocialmedia'));


router.get('/:id/certified', (req, res) => {
    console.log('🔥 Route certified atteinte');
    fetchData(res, req.params.id, 'is_certified','Profile');
  });
  

// ✅ Nouvelle route pour récupérer l'utilisateur connecté via son email Keycloak
router.get('/me', async (req, res) => {
    if (!req.kauth || !req.kauth.grant) {
      return res.status(401).json({ error: 'Non authentifié' });

    }

    
  
    const token = req.kauth.grant.access_token.content;

    console.log("🎯 Email depuis Keycloak :", token.email); // Ajout pour debug
    const email = token.email;
  
    try {
      const [rows] = await db.query('SELECT * FROM User WHERE email = ?', [email]);
  
      if (!rows.length) {
        return res.status(404).json({ error: 'Utilisateur non trouvé dans la base locale' });
      }
  
      res.json(rows[0]); // Renvoie l'utilisateur local complet
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });
  
module.exports = router;
