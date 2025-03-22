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
const createPicture = async (source, description) => {
    const [result] = await db.query(
        'INSERT INTO Picture (link, name, posted_date) VALUES (?, ?, NOW())',
        [source, description]
    );
    return { picture_id: result.insertId, link: source, name: description, posted_date: new Date() };
};

const setProfilePicture = async (userId, pictureId) => {
    await db.query('UPDATE Profile SET profile_picture = ? WHERE user_id = ?', [pictureId, userId]);
};

const addPicture = async (userId, pictureId) => {
    await db.query('UPDATE Profile SET pictures = ? WHERE user_id = ?', [pictureId, userId]);
};

const removePicture = async (userId, pictureId) => {
    const [profile] = await db.query('SELECT pictures FROM Profile WHERE user_id = ?', [userId]);
    if (profile.length && profile[0].pictures === pictureId) {
        await db.query('UPDATE Profile SET pictures = NULL WHERE user_id = ?', [userId]);
    }
};


module.exports = {
    createPicture,
    setProfilePicture,
    addPicture,
    removePicture
};
