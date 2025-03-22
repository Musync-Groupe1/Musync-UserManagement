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
    return user.birthdate;
};

const getGender = async (user) => {
    if (!user) return null;
    return user.gender;
};

const getSocialMedias = async (user) => {
    if (!user) return [];
    const [rows] = await db.query(
        `SELECT sm.social_media_id, sm.social_media_name, usm.token_account, usm.is_private
         FROM UserSocialMedia usm
         JOIN SocialMedia sm ON usm.social_media_id = sm.social_media_id
         WHERE usm.user_id = ?`,
        [user.user_id]
    );
    return rows;
};


const getSocialMediaPrivate = async (user, socialMedia) => {
    if (!user || !socialMedia) return false;
    const [rows] = await db.query(
        `SELECT is_private 
         FROM UserSocialMedia usm
         JOIN SocialMedia sm ON usm.social_media_id = sm.social_media_id
         WHERE usm.user_id = ? AND sm.social_media_name = ?`,
        [user.user_id, socialMedia.social_media_name]
    );
    return rows.length ? rows[0].is_private : false;
};

const getSocialMediaToken = async (user, socialMedia) => {
    if (!user || !socialMedia) return null;
    const [rows] = await db.query(
        `SELECT usm.token_account 
         FROM UserSocialMedia usm
         JOIN SocialMedia sm ON usm.social_media_id = sm.social_media_id
         WHERE usm.user_id = ? AND sm.social_media_name = ?`,
        [user.user_id, socialMedia.social_media_name]
    );
    return rows.length ? rows[0].token_account : null;
};


const getSocialMediaName = (socialMedia) => {
    return socialMedia ? socialMedia.social_media_name : null;
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