const pool = require('../pool');

const setSavingsGoal = async (req, userID) => {
    let { name, target_amount, goal_date = null, starting_amount } = req;

    if (goal_date) {
        goal_date = new Date(goal_date).toISOString().substring(0, 10);
    }

    const query = `INSERT INTO savings_goal (user_id, name, goal_amount, starting_savings, goal_due_date)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING goal_id;`

    try {
        const result = await pool.query(query, [userID, name, target_amount, starting_amount, goal_date]);
        return result.rows;
    } catch (error) {
        console.error('Error saving goal:', error);
        throw error;
    }
};

module.exports = { setSavingsGoal };