const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

const db = mysql.createPool({
    host: 'localhost',
    user: 'user_api5',
    password: 'mot_de_passe_secure',
    database: 'ad',
    port: 3306
});


const getPrivate = async (req, res) => {
    const userId = req.params.id;
    const [rows] = await db.query('SELECT is_private FROM Profile WHERE user_id = ?', [userId]);
    res.json(rows.length ? rows[0].is_private : null);
};

const getCertified = async (req, res) => {
    const userId = req.params.id;
    const [rows] = await db.query('SELECT is_certified FROM Profile WHERE user_id = ?', [userId]);
    res.json(rows.length ? rows[0].is_certified : null);
};

const  getDescription  = async (req, res) => {
    const userId = req.params.id;
    const [rows] = await db.query('SELECT description FROM Profile WHERE user_id = ?', [userId]);
    res.json(rows.length ? rows[0].description : null);
};

const getAcceptedAgeGap = async (req, res) => {
    const userId = req.params.id;
    const [rows] = await db.query('SELECT accepted_age_gap FROM Profile WHERE user_id = ?', [userId]);
    res.json(rows.length ? rows[0].accepted_age_gap : null);
};

const getAcceptedDistance = async (req, res) => {
    const userId = req.params.id;
    const [rows] = await db.query('SELECT accepted_distance FROM Profile WHERE user_id = ?', [userId]);
    res.json(rows.length ? rows[0].accepted_distance : null);
}

const getTargetedGender = async (req, res) => {
    const userId = req.params.id;
    const [rows] = await db.query('SELECT targeted_gender FROM Profile WHERE user_id = ?', [userId]);
    res.json(rows.length ? rows[0].targeted_gender : null);
}

const getFavoriteMusician = async (req, res) => {
    const userId = req.params.id;
    const [rows] = await db.query('SELECT favorite_musician FROM Profile WHERE user_id = ?', [userId]);
    res.json(rows.length ? rows[0].tegeted_gender : null);
}

const getFavoriteMusic = async (req, res) => {
    const userId = req.params.id;
    const [rows] = await db.query('SELECT favorite_music FROM Profile WHERE user_id = ?', [userId]);
    res.json(rows.length ? rows[0].tegeted_gender : null);
}

const getFavoriteStyle = async (req, res) => {
    const userId = req.params.id;
    const [rows] = await db.query('SELECT favorite_musical_style FROM Profile WHERE user_id = ?', [userId]);
    res.json(rows.length ? rows[0].favorite_musical_style : null);
}

const postPrivate = async (req,res) => {
    const userId = req.params.id;
    const {isPrivate} = req.body;
    const [rows] = await db.query('UPDATE Profile SET is_private = ? WHERE user_id = ?', [isPrivate, userId]);
    res.json({ message:  rows.affectedRows > 0 ?  `Profil mis à jour avec succes` : 'erreur' });
    
}

const postCertified = async (req,res) => {
    const userId = req.params.id;
    const {isCertified} = req.body;
    const [rows] = await db.query('UPDATE Profile SET is_certified = ? WHERE user_id = ?', [isCertified, userId]);
    res.json({ message:  rows.affectedRows > 0 ?  `Profil mis à jour avec succes` : 'erreur' });
    
}


const postDescription = async (req,res) => {
    const userId = req.params.id;
    const {description} = req.body;
    const [rows] = await db.query('UPDATE Profile SET description = ? WHERE user_id = ?', [description, userId]);
    res.json({ message:  rows.affectedRows > 0 ?  `Profil mis à jour avec succes` : 'erreur' });
    
}

const postAcceptedAgeGap = async (req,res) => {
    const userId = req.params.id;
    const {accepted_age_gap} = req.body;
    const [rows] = await db.query('UPDATE Profile SET accepted_age_gap = ? WHERE user_id = ?', [accepted_age_gap, userId]);
    res.json({ message:  rows.affectedRows > 0 ?  `Profil mis à jour avec succes` : 'erreur' });
    
}

const postAcceptedDistance = async (req,res) => {
    const userId = req.params.id;
    const {accepted_distance} = req.body;
    const [rows] = await db.query('UPDATE Profile SET accepted_distance = ? WHERE user_id = ?', [accepted_distance, userId]);
    res.json({ message:  rows.affectedRows > 0 ?  `Profil mis à jour avec succes` : 'erreur' });
    
}

const postTargetedGender = async (req,res) => {
    const userId = req.params.id;
    const {targeted_gender} = req.body;
    const [rows] = await db.query('UPDATE Profile SET targeted_gender = ? WHERE user_id = ?', [targeted_gender, userId]);
    res.json({ message:  rows.affectedRows > 0 ?  `Profil mis à jour avec succes` : 'erreur' });
    
}

const postFavoriteMusician = async (req,res) => {
    const userId = req.params.id;
    const {favorite_musician} = req.body;
    const [rows] = await db.query('UPDATE Profile SET favorite_musician = ? WHERE user_id = ?', [favorite_musician, userId]);
    res.json({ message:  rows.affectedRows > 0 ?  `Profil mis à jour avec succes` : 'erreur' });
    
}

const postFavoriteMusic = async (req,res) => {
    const userId = req.params.id;
    const {favorite_music} = req.body;
    const [rows] = await db.query('UPDATE Profile SET favorite_music = ? WHERE user_id = ?', [favorite_music, userId]);
    res.json({ message:  rows.affectedRows > 0 ?  `Profil mis à jour avec succes` : 'erreur' });
    
}

const postFavoriteStyle = async (req,res) => {
    const userId = req.params.id;
    const {favorite_style} = req.body;
    const [rows] = await db.query('UPDATE Profile SET favorite_musical_style = ? WHERE user_id = ?', [favorite_style, userId]);
    res.json({ message:  rows.affectedRows > 0 ?  `Profil mis à jour avec succes` : 'erreur' });
    
}



app.get('/user/:id/private', getPrivate);
app.get('/user/:id/certified', getCertified);
app.get('/user/:id/description', getDescription);
app.get('/user/:id/accepted-age-gap', getAcceptedAgeGap);
app.get('/user/:id/accepted-distance', getAcceptedDistance);
app.get('/user/:id/targeted-gender', getTargetedGender);
app.get('/user/:id/favorite-musician', getFavoriteMusician);
app.get('/user/:id/favorite-music', getFavoriteMusic);
app.get('/user/:id/favorite_musical_style', getFavoriteStyle);



app.put('/user/:id/private', postPrivate);
app.put('/user/:id/certified', postCertified);
app.put('/user/:id/description', postDescription);
app.put('/user/:id/accepted-age', postAcceptedAgeGap);
app.put('/user/:id/accepted-distance', postAcceptedDistance);

app.put('/user/:id/targeted-gender', postTargetedGender);
app.put('/user/:id/favorite-musician', postFavoriteMusician);
app.put('/user/:id/favorite-music', postFavoriteMusic);
app.put('/user/:id/favorite-style', postFavoriteStyle);






app.listen(3000, () => console.log('Server running on port 3000'));

module.exports = {
    getPrivate,
    getCertified,
    getDescription,
    getAcceptedAgeGap,
    getAcceptedDistance,
    getTargetedGender,
    getFavoriteMusician,
    getFavoriteMusic,
    getFavoriteStyle,
    postPrivate,
    postCertified
    
};
