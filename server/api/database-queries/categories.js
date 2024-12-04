const pool = require('../pool');

const getCategories = async (transaction_type) => {
  const query = `SELECT name FROM CATEGORY WHERE category_type = $1;`;
  const result = await pool.query(query, [transaction_type]);
  return result.rows;
};

module.exports = { getCategories };