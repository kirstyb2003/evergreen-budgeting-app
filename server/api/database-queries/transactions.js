const pool = require('../pool');

const logTransaction = async (req, userID) => {
  console.log(req.body);
  const { transactionData, dates } = req.body;
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
    console.error('Error inserting transactions:', error);
    throw error;
  }
};

module.exports = { logTransaction };