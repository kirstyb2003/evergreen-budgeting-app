const pool = require('../pool');

const pingDatabase = async () => {
    await pool.query("SELECT 1");
};

module.exports = { pingDatabase };