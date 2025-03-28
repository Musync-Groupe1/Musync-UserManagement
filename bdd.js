const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'localhost',
    user: 'user_api5',
    password: 'mot_de_passe_secure',
    database: 'ad',
    port: 3306
});

module.exports = db;
