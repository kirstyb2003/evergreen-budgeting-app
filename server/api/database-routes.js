const express = require('express');
const { createUser, findUserByUsername, findUserByEmail, authenticateLogin } = require('./database-queries/users');
const { getCategories } = require('./database-queries/categories');
const { logTransaction, getBalance, getTotalByType, getPastTransactions, getUpcomingTransactions, deleteTransaction, getTransaction, updateTransaction, getMonthlySpend, getMonthlySpendByCategory, getTotalOutgoings, getTotalIncome, getYearlyCats, getWeeklyCats, getMonthlyCats, getWeeklySeries, getMonthlySeries, getYearlySeries } = require('./database-queries/transactions');
const { setSavingsGoal, getSavingsGoals, updateGoalRankings, deleteGoal, getSavingsGoal, updateSavingsGoal, getTotalGoalAmount } = require('./database-queries/savings_goal');
const { setBudget, getBudget, deleteCategories, getMonthlyBudget } = require('./database-queries/budget');
const allowCors = require('./allow-cors');

const router = express.Router();

router.post('/users/register', allowCors(async (req, res) => {
  const { username, email, password, default_currency, starting_balance } = req.body;

  try {
    const user = await createUser(username, email, password, default_currency, starting_balance);
    res.status(201).json({ userId: user.user_id });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
}));

router.post('/users/login', allowCors(async (req, res) => {
  const { username_or_email, password } = req.body;

  try {
    const user = await authenticateLogin(username_or_email, password);
    if (user.length === 0) {
      return res.status(401).json({ message: 'Invalid username, email or password' });
    }

    res.status(200).json({ message: 'Login successful', user: user[0], });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
}));

router.get('/users/find/username/:value', allowCors(async (req, res) => {
  const { value } = req.params;

  try {
    const users = await findUserByUsername(value);
    res.status(200).json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
}));

router.get('/users/find/email/:value', allowCors(async (req, res) => {
  const { value } = req.params;

  try {
    const users = await findUserByEmail(value);
    res.status(200).json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
}));

router.get('/categories/:type', allowCors(async (req, res) => {
  const { type } = req.params;

  try {
    const cats = await getCategories(type);
    res.status(200).json(cats);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
}));


router.post('/transactions/:userID', allowCors(async (req, res) => {
  const { userID } = req.params;
  const transactionData = req.body;

  try {
    const result = await logTransaction(transactionData, userID);
    res.status(201).json({ message: 'Transaction logged successfully', transaction_id: result.transaction_id });
  } catch (error) {
    console.error('Error saving transaction:', error);
    res.status(500).json({ error: 'Failed to log transaction' });
  }
}));

router.post('/budget/:userID', allowCors(async (req, res) => {
  const { userID } = req.params;
  const budgetData = req.body;

  try {
    const result = await setBudget(budgetData, userID);
    res.status(201).json({ message: 'Budget saved successfully', inserted_rows: result });
  } catch (err) {
    console.error('Error saving budget: ', err);
    res.status(500).json({ error: 'Failed to save budget' });
  }

}));

router.get('/budget/:userID', async (req, res) => {
  const { userID } = req.params;

  try {
    const budgets = await getBudget(userID);
    res.json(budgets);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching budget');
  }
});

router.post('/budget/delete/:userID', allowCors(async (req, res) => {
  const { userID } = req.params;
  const deleteCats = req.body;

  try {
    const result = await deleteCategories(deleteCats, userID);
    res.status(201).json({ message: 'Budget categories deleted successfully', inserted_rows: result });
  } catch (err) {
    console.error('Error deleting budget categories: ', err);
    res.status(500).json({ error: 'Failed to delete budget categories' });
  }

}));

router.post('/savings-goal/:userID', allowCors(async (req, res) => {
  const { userID } = req.params;
  const goalData = req.body;

  try {
    const result = await setSavingsGoal(goalData, userID);
    res.status(201).json({ message: 'Savings goal saved successfully', inserted_rows: result });
  } catch (err) {
    console.error('Error saving the savings goal: ', err);
    res.status(500).json({ error: "Failed to save savings goal" });
  }
}));

router.get('/balance/:userID', allowCors(async (req, res) => {
  const { userID } = req.params;

  try {
    const balance = await getBalance(userID);
    res.json(balance);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching bank balance');
  }
}));

router.get('/balance/:userID/:type', allowCors(async (req, res) => {
  const { userID, type } = req.params;

  try {
    const total = await getTotalByType(userID, type);
    res.json(total);
  } catch (err) {
    console.error(err);
    res.status(500).send(`Error fetching total balance for ${type}`);
  }
}));

router.get('/transactions/:userID/past/:type', allowCors(async (req, res) => {
  const { userID, type } = req.params;

  try {
    const trans = await getPastTransactions(userID, type);
    res.json(trans);
  } catch (err) {
    console.error(err);
    res.status(500).send(`Error fetching past ${type} transactions`);
  }
}));

router.get('/transactions/:userID/upcoming/:type', allowCors(async (req, res) => {
  const { userID, type } = req.params;

  try {
    const trans = await getUpcomingTransactions(userID, type);
    res.json(trans);
  } catch (err) {
    console.error(err);
    res.status(500).send(`Error fetching upcoming ${type} transactions`);
  }
}));

router.get('/savings-goals/:userID', allowCors(async (req, res) => {
  const { userID } = req.params;

  try {
    const goals = await getSavingsGoals(userID);
    res.json(goals);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching savings goals');
  }
}))

router.post('/savings-goals/update', allowCors(async (req, res) => {
  const goalData = req.body;

  try {
    const result = await updateGoalRankings(goalData);
    res.status(201).json({ message: 'Goal rankings saved successfully', inserted_rows: result });
  } catch (err) {
    console.error('Error saving goal rankings: ', err);
    res.status(500).json({ error: "Failed to save goal rankings" });
  }
}));

router.post('/savings-goals/delete/:goalID', allowCors(async (req, res) => {
  const { goalID } = req.params;
  const { userID } = req.body;

  try {
    const result = await deleteGoal(goalID, userID);
    res.status(201).json({ message: 'Deleted goal successfully.', inserted_rows: result });
  } catch (err) {
    console.error('Error deleting goal.', err);
    res.status(500).json({ error: "Failed to delete the savings goal." });
  }
}))

router.get('/savings-goal/:id', allowCors(async (req, res) => {
  const { id } = req.params;

  try {
    const goal = await getSavingsGoal(id);
    res.json(goal);
  }  catch (err) {
    console.error(err);
    res.status(500).send(`Error fetching goal ${id}`);
  }
}));

router.post('/savings-goal/update/:goalID', allowCors(async (req, res) => {
  const { goalID } = req.params;
  const goalData = req.body;

  try {
    const result = await updateSavingsGoal(goalData, goalID);
    res.status(201).json({ message: 'Savings goal saved successfully', inserted_rows: result });
  } catch (err) {
    console.error('Error saving the savings goal: ', err);
    res.status(500).json({ error: "Failed to save savings goal" });
  }
}))

router.post('/transaction/delete/:id', allowCors(async (req, res) => {
  const { id } = req.params;
  const { repeatDelete, date } = req.body;

  try {
    const result = await deleteTransaction(id, repeatDelete, date);
    res.status(201).json({ message: 'Deleted transaction(s) successfully.', inserted_rows: result });
  } catch (err) {
    console.error('Error deleting transaction(s).', err);
    res.status(500).json({ error: "Failed to delete the transaction(s)." });
  }
}))

router.get('/transaction/:id', allowCors(async (req, res) => {
  const { id } = req.params;

  try {
    const trans = await getTransaction(id);
    res.json(trans);
  }  catch (err) {
    console.error(err);
    res.status(500).send(`Error fetching transaction ${id}`);
  }
}));

router.post('/transactions/update/:updateOption/:transID', allowCors(async (req, res) => {
  const { updateOption, transID } = req.params;
  const transactionData = req.body;

  try {
    const result = await updateTransaction(transactionData, transID, updateOption);
    res.status(201).json({ message: 'Transaction updated successfully', transaction_id: result.transaction_id });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
}));

router.get('/budget/total/:userID', allowCors(async (req, res) => {
  const { userID } = req.params;

  try {
    const total = await getMonthlyBudget(userID);
    res.json(total);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching monthly budget total');
  }
}));

router.get('/spent/month/:userID', allowCors(async (req, res) => {
  const { userID } = req.params;

  try {
    const total = await getMonthlySpend(userID);
    res.json(total);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching monthly budget total');
  }
}));

router.get('/transactions/spent/:userID/:category', allowCors(async (req, res) => {
  const { userID, category } = req.params;

  try {
    const total = await getMonthlySpendByCategory(userID, category);
    res.json(total);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching category spending total');
  }
}));

router.get('/transactions/outgoings/:userID', allowCors(async (req, res) => {
  const { userID } = req.params;

  try {
    const total = await getTotalOutgoings(userID);
    res.json(total);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching total outgoings');
  }
}));

router.get('/transactions/total-income/:userID', allowCors(async (req, res) => {
  const { userID } = req.params;

  try {
    const total = await getTotalIncome(userID);
    res.json(total);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching total outgoings');
  }
}));

router.get('/savings-goals/total-goal/:userID', allowCors(async (req, res) => {
  const { userID } = req.params;

  try {
    const total = await getTotalGoalAmount(userID);
    res.json(total);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching total outgoings');
  }

}));

router.get('/transactions/:userID/week/:transType', allowCors(async (req, res) => {
  const { transType, userID } = req.params;

  try {
    const cats = await getWeeklyCats(userID, transType);
    res.json(cats);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching total outgoings');
  }

}));

router.get('/transactions/:userID/month/:transType', allowCors(async (req, res) => {
  const { transType, userID } = req.params;

  try {
    const cats = await getMonthlyCats(userID, transType);
    res.json(cats);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching total outgoings');
  }

}));

router.get('/transactions/:userID/year/:transType', allowCors(async (req, res) => {
  const { transType, userID } = req.params;

  try {
    const cats = await getYearlyCats(userID, transType);
    res.json(cats);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching total outgoings');
  }

}));

router.get('/transactions/:userID/timeseries/week', allowCors(async (req, res) => {
  const { userID } = req.params;

  try {
    const cats = await getWeeklySeries(userID);
    res.json(cats);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching total outgoings');
  }

}));

router.get('/transactions/:userID/timeseries/month', allowCors(async (req, res) => {
  const { userID } = req.params;

  try {
    const cats = await getMonthlySeries(userID);
    res.json(cats);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching total outgoings');
  }

}));

router.get('/transactions/:userID/timeseries/year', allowCors(async (req, res) => {
  const { userID } = req.params;

  try {
    const cats = await getYearlySeries(userID);
    res.json(cats);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching total outgoings');
  }

}));


module.exports = router;