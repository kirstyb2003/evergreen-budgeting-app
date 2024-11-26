const pool = require('./pool');

const createUser = async (username, email, password, default_currency, starting_balance) => {
  const query = `
    INSERT INTO users (username, email, password, default_currency, starting_balance)
    VALUES ($1, $2, $3, $4, $5) RETURNING user_id;
  `;
  const result = await pool.query(query, [username, email, password, default_currency, starting_balance]);
  return result.rows[0];
};

const findUserByUsername = async (username) => {
  const query = `SELECT * FROM users WHERE username = $1;`;
  const result = await pool.query(query, [username]);
  return result.rows;
};

const findUserByEmail = async (email) => {
  const query = `SELECT * FROM users WHERE email = $1;`;
  const result = await pool.query(query, [email]);
  return result.rows;
};

module.exports = { createUser, findUserByUsername, findUserByEmail };
