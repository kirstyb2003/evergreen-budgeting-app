const pool = require('../pool');

// Simple query to keep the database alive
const pingDatabase = async () => {
    const result = await pool.query("SELECT 1");
    return result.rows;
};

module.exports = { pingDatabase };