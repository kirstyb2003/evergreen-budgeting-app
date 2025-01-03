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

const getSavingsGoals = async (userID) => {
    const query = `SELECT goal_id, name, goal_amount, starting_savings, goal_due_date, ranking
    FROM savings_goal
    WHERE user_id = $1;`;

    try {
        const result = await pool.query(query, [userID]);
        return result.rows;
    } catch (err) {
        console.error('Error retrieving savings goals', err);
        throw err;
    }
};

const updateGoalRankings = async (req) => {
    if (req.length === 0) {
        return;
    }

    const values = req
        .map((_goal, index) => `(CAST($${index * 2 + 1} AS INTEGER), CAST($${index * 2 + 2} AS INTEGER))`)
        .join(', ');


    const params = req.flatMap(goal => [goal.goal_id, goal.ranking]);

    const query = `
        UPDATE savings_goal AS sg
        SET ranking = updates.ranking
        FROM (VALUES ${values}) AS updates(goal_id, ranking)
        WHERE sg.goal_id = updates.goal_id AND sg.ranking != updates.ranking;`;

    try {
        const result = await pool.query(query, params);
        return result.rows;
    } catch (error) {
        console.error('Error saving goals ordering:', error);
        throw error;
    }
}

module.exports = { setSavingsGoal, getSavingsGoals, updateGoalRankings };