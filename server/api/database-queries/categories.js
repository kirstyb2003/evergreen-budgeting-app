const pool = require('../pool');

const getCategories = async (transaction_type) => {
  const query = `SELECT name FROM CATEGORY WHERE category_type = $1;`;
  const result = await pool.query(query, [transaction_type]);
  return result.rows;
};

const getCategoryID = async(category_name, category_type) => {
  const query = `SELECT category_id FROM CATEGORY WHERE name = $1 AND category_type = $2;`;
  const result = await pool.query(query, [category_name, category_type]);
  return result.rows[0];
}

const getCategoryDetails = async(category_id) => {
  const query = `SELECT name, category_type WHERE category_id = $1`;
  const result = await pool.query(query, [category_id]);
  return result.rows[0];
}

module.exports = { getCategories, getCategoryID, getCategoryDetails };