const express = require('express');
const mysql = require('mysql2/promise');
const app = express();
app.use(express.json());

const db = mysql.createPool({
    host: 'localhost',
    user: 'root', 
    password: '', 
    database: 'ad',
    port: 3307 
});

const { getUserFromId, getFirstName, getLastName, getEmail, getBirthDate, getGender, getSocialMedias, getSocialMediaPrivate, getSocialMediaToken, getSocialMediaName } = require('./UserController');

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

const getDescription = async (req, res) => {
    const userId = req.params.id;
    const [rows] = await db.query('SELECT description FROM Profile WHERE user_id = ?', [userId]);
    res.json(rows.length ? rows[0].description : null);
};

const getAcceptedAgeGap = async (req, res) => {
    const userId = req.params.id;
    const [rows] = await db.query('SELECT accepted_age_gap FROM Profile WHERE user_id = ?', [userId]);
    res.json(rows.length ? rows[0].accepted_age_gap : null);
};

app.get('/user/:id', async (req, res) => {
    const user = await getUserFromId(req.params.id);
    res.json(user);
});

app.get('/user/:id/first-name', async (req, res) => {
    const user = await getUserFromId(req.params.id);
    res.json(await getFirstName(user));
});

app.get('/user/:id/last-name', async (req, res) => {
    const user = await getUserFromId(req.params.id);
    res.json(await getLastName(user));
});

app.get('/user/:id/email', async (req, res) => {
    const user = await getUserFromId(req.params.id);
    res.json(await getEmail(user));
});

app.get('/user/:id/birth-date', async (req, res) => {
    const user = await getUserFromId(req.params.id);
    res.json(await getBirthDate(user));
});

app.get('/user/:id/gender', async (req, res) => {
    const user = await getUserFromId(req.params.id);
    res.json(await getGender(user));
});

app.get('/user/:id/social-medias', async (req, res) => {
    const user = await getUserFromId(req.params.id);
    res.json(await getSocialMedias(user));
});

app.get('/user/:id/social-media/private/:name', async (req, res) => {
    const user = await getUserFromId(req.params.id);
    const socialMedia = { name: req.params.name };
    res.json(await getSocialMediaPrivate(user, socialMedia));
});

app.get('/user/:id/social-media/token/:name', async (req, res) => {
    const user = await getUserFromId(req.params.id);
    const socialMedia = { name: req.params.name };
    res.json(await getSocialMediaToken(user, socialMedia));
});

app.get('/user/:id/social-media/name/:name', async (req, res) => {
    const user = await getUserFromId(req.params.id);
    const socialMedia = { name: req.params.name };
    res.json(await getSocialMediaName(user, socialMedia));
});

app.get('/user/:id/private', getPrivate);
app.get('/user/:id/certified', getCertified);
app.get('/user/:id/description', getDescription);
app.get('/user/:id/accepted-age-gap', getAcceptedAgeGap);

app.listen(3000, () => console.log('Server running on port 3000'));

module.exports = {
    getPrivate,
    getCertified,
    getDescription,
    getAcceptedAgeGap
};