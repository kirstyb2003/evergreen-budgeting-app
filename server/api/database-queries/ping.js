const pool = require('../pool');

const pingDatabase = async () => {
    const result = await pool.query("SELECT 1");
    return result.rows;
};

module.exports = { pingDatabase };