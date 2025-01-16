const pool = require('../pool');
const { v4: uuidv4 } = require('uuid');

const logTransaction = async (req, userID) => {
  let transactionData, dates;

  if (req.transactionData) {
    ({ transactionData, dates } = req);
  } else {
    transactionData = req;
    dates = req.dates;
  }

  const { type, category, name, transaction_date, amount, shop = null, payment_method = null, repeat, repeat_schedule = null, end_date = null } = transactionData;

  let repeatGroupId = null;

  if (repeat) {
    repeatGroupId = uuidv4();
  }

  const categoryQuery = `SELECT category_id FROM category WHERE name = $1 LIMIT 1;`;
  const categoryResult = await pool.query(categoryQuery, [category]);
  const categoryId = categoryResult.rows[0].category_id;

  const transactionValues = dates.map(date => [userID, categoryId, type, name, new Date(date).toISOString().substring(0, 10), amount, shop || null, payment_method || null, repeat || false, repeat_schedule || null, end_date ? new Date(end_date).toISOString().substring(0, 10) : null, repeatGroupId]);

  const insertQuery = `
    INSERT INTO transaction (user_id, category_id, type, name, transaction_date, amount, shop, payment_method, repeat, repeat_schedule, end_date, repeat_group_id)
    VALUES ${transactionValues.map((_, i) => `($${i * 12 + 1}, $${i * 12 + 2}, $${i * 12 + 3}, $${i * 12 + 4}, $${i * 12 + 5}, $${i * 12 + 6}, $${i * 12 + 7}, $${i * 12 + 8}, $${i * 12 + 9}, $${i * 12 + 10}, $${i * 12 + 11}, $${i * 12 + 12})`).join(', ')}
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
  const query = `SELECT t.transaction_id, t.name, c.name as category, t.amount, t.transaction_date, t.shop, t.payment_method, t.repeat, t.repeat_schedule, t.end_date, t.type
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
  const query = `SELECT t.transaction_id, t.name, c.name as category, t.amount, t.transaction_date, t.shop, t.payment_method, t.repeat, t.repeat_schedule, t.end_date, t.type
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

const deleteTransaction = async (id, deleteType, date = null) => {
  let query;
  let params = [];

  switch (deleteType || 'single') {
    case 'single':
      query = `DELETE FROM transaction WHERE transaction_id = $1;`;
      params = [id];
      break;
    case 'all':
      query = `
        DELETE FROM transaction
        WHERE repeat = true
        AND repeat_group_id IN (
          SELECT repeat_group_id
          FROM transaction
          WHERE transaction_id = $1
        );
      `;
      params = [id];
      break;
    case 'after':
      if (!date) throw new Error('Date is required for "after" deleteType');
      query = `
        DELETE FROM transaction
        WHERE repeat = true
        AND transaction_date >= $1
        AND repeat_group_id IN (
          SELECT repeat_group_id
          FROM transaction
          WHERE transaction_id = $2
        );
      `;
      params = [date, id];
      break;
    default:
      throw new Error('Invalid deleteType');
  }

  try {
    const result = await pool.query(query, params);
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

const updateTransaction = async (req, transID, updateOption) => {
  let transactionData, date;

  if (req.transactionData) {
    ({ transactionData, date } = req);
  } else {
    transactionData = req;
    date = req.date;
  }

  const { type, category, name, transaction_date, amount, shop = null, payment_method = null, repeat = false, repeat_schedule = null, end_date = null } = transactionData;

  const categoryQuery = `SELECT category_id FROM category WHERE name = $1 LIMIT 1;`;
  const categoryResult = await pool.query(categoryQuery, [category]);
  const categoryId = categoryResult.rows[0]?.category_id;

  if (!categoryId) {
    throw new Error(`Category "${category}" not found`);
  }

  let query;
  let params = [];

  switch (updateOption || 'single') {
    case 'single':
      query = `
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
      params = [categoryId, type, name, transaction_date, amount, shop, payment_method, repeat, repeat_schedule, end_date, transID];
      break;
    case 'all':
      query = `
        UPDATE transaction
        SET 
          category_id = $1,
          type = $2,
          name = $3,
          amount = $4,
          shop = $5,
          payment_method = $6
        WHERE repeat_group_id = (
          SELECT repeat_group_id FROM transaction WHERE transaction_id = $7
        );
      `;
      params = [categoryId, type, name, amount, shop, payment_method, transID];
      break;
    case 'after':
      query = `
        UPDATE transaction
        SET 
          category_id = $1,
          type = $2,
          name = $3,
          amount = $4,
          shop = $5,
          payment_method = $6
        WHERE repeat_group_id = (
          SELECT repeat_group_id FROM transaction WHERE transaction_id = $7
        )
        AND transaction_date >= $8;
      `;
      params = [categoryId, type, name, amount, shop, payment_method, transID, date];
      break;
    default:
      throw new Error('Invalid deleteType');
  }

  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (err) {
    console.error('Error updating transaction', err);
    throw err;
  }
};

module.exports = { logTransaction, getBalance, getTotalByType, getPastTransactions, getUpcomingTransactions, deleteTransaction, getTransaction, updateTransaction };