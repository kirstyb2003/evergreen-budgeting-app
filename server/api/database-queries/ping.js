const pool = require('../pool');

const pingDatabase = async () => {
    const result = await pool.query("SELECT name FROM category;");
    return result.rows;
};

module.exports = { pingDatabase };