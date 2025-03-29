const pool = require('../pool');
const { getCategoryID } = require('./categories');

const setBudget = async (budgetData, userID) => {
    const insertedBudgets = [];

    for (const entry of budgetData) {
        const { category, amount, category_type } = entry;

        const catID = await getCategoryID(category, category_type);

        if (!catID) {
            return catID.status(404).json({ error: `Category, ${category}, not found` });
        }

        const query = `INSERT INTO budget (user_id, category_id, amount)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, category_id)
        DO UPDATE
        SET amount = EXCLUDED.amount
        RETURNING budget_id;`

        const result = await pool.query(query, [userID, catID.category_id, amount]);
        insertedBudgets.push(result.rows[0]);
    }

    return insertedBudgets;
};

const getBudget = async (userID) => {
    const query = `SELECT b.amount, c.category_type, c.name 
        FROM budget b
        JOIN category c ON b.category_id = c.category_id
        WHERE b.user_id = $1;`;

    const result = await pool.query(query, [userID]);
    return result.rows;
}

const deleteCategories = async (deleteCats, userID) => {
    const deletedCats = [];

    for (const entry of deleteCats) {
        const { name, type } = entry;

        const catID = await getCategoryID(name, type);

        if (!catID) {
            throw new Error(`Category, ${name}, not found`);
        }

        const query = `DELETE FROM budget WHERE user_id = $1 AND category_id = $2;`;

        const result = await pool.query(query, [userID, catID.category_id]);
        deletedCats.push(result.rows[0]);
    }

    return deletedCats;
};

const getMonthlyBudget = async (userID) => {
    const query = `SELECT SUM(b.amount) AS total 
        FROM budget b
        WHERE b.user_id = $1;`;

    const result = await pool.query(query, [userID]);
    return parseFloat(result.rows[0]?.total) || 0.00;
};

module.exports = { setBudget, getBudget, deleteCategories, getMonthlyBudget };