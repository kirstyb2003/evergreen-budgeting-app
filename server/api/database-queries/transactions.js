const pool = require('../pool');

const logTransaction = async (transactionData, userID) => {
    const { type, category, name, transaction_date, amount, shop = null, payment_method = null, repeat, repeat_schedule = null, end_date = null } = transactionData;

    const query = `
    INSERT INTO transaction (
      user_id, category_id, type, name, transaction_date, amount, shop, 
      payment_method, repeat, repeat_schedule, end_date
    ) 
    VALUES (
      $1, (SELECT category_id FROM category WHERE name = $2 LIMIT 1), $3, $4, $5::timestamp, $6, $7, $8, $9, $10, $11::timestamp
    ) RETURNING transaction_id;
  `;
  
    const values = [userID, category, type, name, new Date(transaction_date), amount, shop || null, payment_method || null, repeat || false, repeat_schedule || null, end_date ? new Date(end_date) : null];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error inserting transaction:', error);
        throw error;
    }
};

module.exports = { logTransaction };