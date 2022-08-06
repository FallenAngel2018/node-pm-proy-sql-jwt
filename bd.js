
const sql = require('mssql')
require("dotenv").config();

const dbSettings = {
    user: process.env.SQL_SVR_2_USER_ID,
    password: process.env.SQL_SVR_2_PWD, // "Sqlserverpassword2021",
    // server: "DESKTOP-STTIOAH\SQLEXPRESS",
    server: process.env.SQL_SVR_2_SERVER_NAME,
    database: process.env.SQL_SVR_2_DB_NAME,
    port: 1433,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 25000
    },
    options: {
        encrypt: true, // for azure
        trustServerCertificate: true, // change to true for local dev / self signed certs
    }
};

// module.exports = pool

module.exports.getConnection = async function(){
    try {
        const pool = await sql.connect(dbSettings);
        return pool;
    } catch (error) {
        console.log(error);
    }
}