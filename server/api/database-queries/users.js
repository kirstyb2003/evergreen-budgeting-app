const pool = require('../pool');

const createUser = async (username, email, password, default_currency, starting_balance) => {
  const query = `
    INSERT INTO users (username, email, password, default_currency, starting_balance)
    VALUES ($1, $2, crypt($3, gen_salt('bf')), $4, $5) RETURNING user_id;
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

const authenticateLogin = async (username_or_email, password) => {
  const query = `SELECT * FROM users WHERE (username = $1 OR email = $1) AND password = crypt($2, password)`;
  const result = await pool.query(query, [username_or_email, password]);

  const username = await pool.query(`SELECT * FROM users WHERE (username = $1 OR email = $1)`, [username_or_email]);
  const passwordCheck = await pool.query(`SELECT * FROM users WHERE password = crypt($1, password)`, [password]);

  console.error(username);
  console.error(passwordCheck);


  if (result.rows.length > 0) {
    const { password, ...userWithoutPassword } = result.rows[0];
    return userWithoutPassword;
  } else {
    return null;
  }
}

module.exports = { createUser, findUserByUsername, findUserByEmail, authenticateLogin };