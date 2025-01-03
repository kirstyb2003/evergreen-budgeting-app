const pool = require('../pool');

const setSavingsGoal = async (req, userID) => {
    let { name, target_amount, goal_date = null, starting_amount } = req;

    if (goal_date) {
        goal_date = new Date(goal_date).toISOString().substring(0, 10);
    }

    const countQuery = `SELECT COUNT(*) AS goal_count
    FROM savings_goal
    WHERE user_id = $1;`;

    const insertQuery = `INSERT INTO savings_goal (user_id, name, goal_amount, starting_savings, goal_due_date, ranking)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING goal_id;`

    try {
        const savingsCount = await pool.query(countQuery, [userID]);
        const goalCount = parseInt(savingsCount.rows[0].goal_count, 10) || 0;
        const result = await pool.query(insertQuery, [userID, name, target_amount, starting_amount, goal_date, goalCount + 1]);
        return result.rows;
    } catch (error) {
        console.error('Error saving goal:', error);
        throw error;
    }
};

const getSavingsGoals = async(userID) => {
    const query = `SELECT goal_id, name, goal_amount, starting_savings, goal_due_date, ranking
    FROM savings_goal
    WHERE user_id = $1;`;

    try {
        const result = await pool.query(query, [userID]);
        console.log(result.rows);
        return result.rows;
    } catch (err) {
        console.error('Error retrieving savings goals', err);
        throw err;
    }
};

module.exports = { setSavingsGoal, getSavingsGoals };