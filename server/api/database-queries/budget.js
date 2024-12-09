const pool = require('../pool');
const { getCategoryID } = require('./categories');

const setBudget = async (budgetData, userID) => {
    const insertedBudgets = [];

    for (const entry of budgetData) {
        const { category, amount, category_type } = entry;

        const catID = await getCategoryID(category, category_type);

        if (!catID) {
            return res.status(404).json({ error: `Category, ${category}, not found` });
        }

        const query = `INSERT INTO budget (user_id, category_id, amount)
        VALUES ($1, $2, $3)
        RETURNING budget_id;`;
        
        const result = await pool.query(query, [userID, catID.category_id, amount]);
        insertedBudgets.push(result.rows[0]);
    }

    return insertedBudgets;
};

module.exports = { setBudget };