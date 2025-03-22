const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

const db = mysql.createPool({
    host: 'localhost',
    user: 'root', 
    password: '', 
    database: 'ad',
    port:3307 
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

app.get('/user/:id/private', getPrivate);
app.get('/user/:id/certified', getCertified);
app.get('/user/:id/description', getDescription);
app.get('/user/:id/accepted-age-gap', getAcceptedAgeGap);

module.exports = {
    getPrivate,
    getCertified,
    getDescription,
    getAcceptedAgeGap
};
