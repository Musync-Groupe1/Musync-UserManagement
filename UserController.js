const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root', 
    password: '', 
    database: 'ad',
    port: 3307 
});

const getUserFromId = async (id) => {
    const [rows] = await db.query('SELECT * FROM User WHERE user_id = ?', [id]);
    return rows.length ? rows[0] : null;
};

const getFirstName = async (user) => {
    if (!user) return null;
    return user.first_name;
};

const getLastName = async (user) => {
    if (!user) return null;
    return user.last_name;
};

const getEmail = async (user) => {
    if (!user) return null;
    return user.email;
};

const getBirthDate = async (user) => {
    if (!user) return null;
    return user.birth_date;
};

const getGender = async (user) => {
    if (!user) return null;
    return user.gender;
};

const getSocialMedias = async (user) => {
    if (!user) return [];
    const [rows] = await db.query('SELECT * FROM UserSocialMedia WHERE user_id = ?', [user.id]);
    return rows;
};

const getSocialMediaPrivate = async (user, socialMedia) => {
    if (!user || !socialMedia) return false;
    const [rows] = await db.query('SELECT is_private FROM UserSocialMedia WHERE user_id = ? AND name = ?', [user.id, socialMedia.name]);
    return rows.length ? rows[0].is_private : false;
};

const getSocialMediaToken = async (user, socialMedia) => {
    if (!user || !socialMedia) return null;
    const [rows] = await db.query('SELECT token FROM UserSocialMedia WHERE user_id = ? AND name = ?', [user.id, socialMedia.name]);
    return rows.length ? rows[0].token : null;
};

const getSocialMediaName = async (user, socialMedia) => {
    if (!user || !socialMedia) return null;
    return socialMedia.name;
};

module.exports = {
    getUserFromId,
    getFirstName,
    getLastName,
    getEmail,
    getBirthDate,
    getGender,
    getSocialMedias,
    getSocialMediaPrivate,
    getSocialMediaToken,
    getSocialMediaName
};