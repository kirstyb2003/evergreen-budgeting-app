const pool = require('../pool');

const logTransaction = async (req, userID) => {
  let transactionData, dates;

  if (req.transactionData) {
    ({ transactionData, dates } = req);
  } else {
    transactionData = req;
    dates = req.dates;
  }

  const { type, category, name, transaction_date, amount, shop = null, payment_method = null, repeat, repeat_schedule = null, end_date = null } = transactionData;

  const categoryQuery = `SELECT category_id FROM category WHERE name = $1 LIMIT 1;`;
  const categoryResult = await pool.query(categoryQuery, [category]);
  const categoryId = categoryResult.rows[0].category_id;

  const transactionValues = dates.map(date => [userID, categoryId, type, name, new Date(date).toISOString().substring(0, 10), amount, shop || null, payment_method || null, repeat || false, repeat_schedule || null, end_date ? new Date(end_date).toISOString().substring(0, 10) : null]);

  const insertQuery = `
    INSERT INTO transaction (user_id, category_id, type, name, transaction_date, amount, shop, payment_method, repeat, repeat_schedule, end_date)
    VALUES ${transactionValues.map((_, i) => `($${i * 11 + 1}, $${i * 11 + 2}, $${i * 11 + 3}, $${i * 11 + 4}, $${i * 11 + 5}, $${i * 11 + 6}, $${i * 11 + 7}, $${i * 11 + 8}, $${i * 11 + 9}, $${i * 11 + 10}, $${i * 11 + 11})`).join(', ')}
    RETURNING transaction_id;`;

  const flatValues = transactionValues.flat();

  try {
    const result = await pool.query(insertQuery, flatValues);
    return result.rows;
  } catch (error) {
    console.error('Error inserting transactions: ', error);
    throw error;
  }
};

const getTotalByType = async (userID, type) => {
  const query = `
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM transaction
    WHERE user_id = $1 
    AND type = $2
    AND transaction_date <= CURRENT_DATE;
  `;
  const result = await pool.query(query, [userID, type]);
  return parseFloat(result.rows[0].total) || 0.00;
};

const getStartingBalance = async (userID) => {
  const query = `
    SELECT COALESCE(starting_balance, 0) AS starting_balance
    FROM users
    WHERE user_id = $1;
  `;
  const result = await pool.query(query, [userID]);
  return parseFloat(result.rows[0]?.starting_balance) || 0.00;
};

const getBalance = async (userID) => {
  try {
    const [income, expenses, savings, startingBalance] = await Promise.all([
      getTotalByType(userID, 'income'),
      getTotalByType(userID, 'expense'),
      getTotalByType(userID, 'savings'),
      getStartingBalance(userID),
    ]);

    const balance = (startingBalance + income - expenses - savings).toFixed(2);
    return balance;
  } catch (error) {
    console.error('Error fetching balance: ', error);
    throw error;
  }
};

const getPastTransactions = async (userID, type) => {
  const query = `SELECT t.transaction_id, t.name, c.name as category, t.amount, t.transaction_date, t.shop, t.payment_method, t.repeat, t.repeat_schedule, t.end_date
  FROM transaction as t, category as c
  WHERE c.category_id = t.category_id
  AND t.user_id = $1
  AND t.type = $2
  AND transaction_date <= CURRENT_DATE;`;

  try {
    const result = await pool.query(query, [userID, type]);
    return result.rows;
  } catch (error) {
    console.error(`Error retrieving past ${type} transactions: `, error);
    throw error;
  }
};

const getUpcomingTransactions = async (userID, type) => {
  const query = `SELECT t.transaction_id, t.name, c.name as category, t.amount, t.transaction_date, t.shop, t.payment_method, t.repeat, t.repeat_schedule, t.end_date
  FROM transaction as t, category as c
  WHERE c.category_id = t.category_id
  AND t.user_id = $1
  AND t.type = $2
  AND transaction_date > CURRENT_DATE;`;

  try {
    const result = await pool.query(query, [userID, type]);
    return result.rows;
  } catch (error) {
    console.error(`Error retrieving upcoming ${type} transactions: `, error);
    throw error;
  }
};

const deleteTransaction = async (id) => {
  const query = `DELETE FROM transaction WHERE transaction_id = $1`;

  try {
    const result = await pool.query(query, [id]);
    return result.rows;
  } catch (error) {
    console.error(`Error deleting transaction ${id}: `, error);
    throw error;
  }
};

const getTransaction = async (id) => {
  const query = `SELECT t.name, c.name AS category, t.type, t.transaction_date, t.amount, t.shop, t.payment_method, t.repeat, t.repeat_schedule, t.end_date
  FROM transaction AS t, category AS c
  WHERE t.category_id = c.category_id
  AND transaction_id = $1;`;

  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (err) {
    console.error('Error retrieving savings goals', err);
    throw err;
  }
};

const updateTransaction = async (req, transID) => {
  const {type, category, name, transaction_date, amount, shop = null, payment_method = null, repeat = false, repeat_schedule = null, end_date = null} = req;

  const categoryQuery = `SELECT category_id FROM category WHERE name = $1 LIMIT 1;`;
  const categoryResult = await pool.query(categoryQuery, [category]);
  const categoryId = categoryResult.rows[0]?.category_id;

  if (!categoryId) {
    throw new Error(`Category "${category}" not found`);
  }

  const updateQuery = `
    UPDATE transaction
    SET 
      category_id = $1,
      type = $2,
      name = $3,
      transaction_date = $4,
      amount = $5,
      shop = $6,
      payment_method = $7,
      repeat = $8,
      repeat_schedule = $9,
      end_date = $10
    WHERE transaction_id = $11;
  `;

  try {
    const result = await pool.query(updateQuery, [ categoryId, type, name, transaction_date, amount, shop, payment_method, repeat, repeat_schedule, end_date, transID]);
    return result.rows;
  } catch (err) {
    console.error('Error updating transaction', err);
    throw err;
  }
};

module.exports = { logTransaction, getBalance, getTotalByType, getPastTransactions, getUpcomingTransactions, deleteTransaction, getTransaction, updateTransaction };