const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const dbRoutes = require('../database-routes');
const { createUser, authenticateLogin, findUserByUsername, findUserByEmail } = require('../database-queries/users');
const { getCategories } = require('../database-queries/categories');
const { logTransaction, getPastTransactions, getBalance, getTotalByType, getUpcomingTransactions, deleteTransaction, getTransaction, updateTransaction, getMonthlySpendByCategory, getMonthlySpend, getTotalOutgoings, getTotalIncome, getWeeklyCats, getMonthlyCats, getYearlyCats, getWeeklySeries, getMonthlySeries, getYearlySeries, getWeeklyExpenses, getMonthlyExpenses, getYearlyExpenses } = require('../database-queries/transactions');
const { setBudget, getBudget, deleteCategories, getMonthlyBudget } = require('../database-queries/budget');
const { setSavingsGoal, getSavingsGoals, updateGoalRankings, deleteGoal, getSavingsGoal, updateSavingsGoal, getTotalGoalAmount } = require('../database-queries/savings_goal');

jest.mock('jsonwebtoken');
jest.mock('../database-queries/users');
jest.mock('../database-queries/categories');
jest.mock('../database-queries/transactions');
jest.mock('../database-queries/budget');
jest.mock('../database-queries/savings_goal');

const app = express();
app.use(express.json());
app.use('/api', dbRoutes);

// Unit Tests
describe('Database Routes - Unit Tests', () => {
  describe('POST /users/register', () => {
    it('should create a new user and return userId', async () => {
      createUser.mockResolvedValueOnce({ user_id: 1 });

      const res = await request(app)
        .post('/api/users/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          default_currency: 'USD',
          starting_balance: 1000,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({ userId: 1 });
      expect(createUser).toHaveBeenCalledWith(
        'testuser',
        'test@example.com',
        'password123',
        'USD',
        1000
      );
    });

    it('should return 500 if an error occurs', async () => {
      createUser.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app)
        .post('/api/users/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          default_currency: 'USD',
          starting_balance: 1000,
        });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('POST /users/login', () => {
    it('should authenticate a user and return a token', async () => {
      authenticateLogin.mockResolvedValueOnce({ user_id: 1 });
      jwt.sign.mockReturnValueOnce('mockToken');

      const res = await request(app)
        .post('/api/users/login')
        .send({
          username_or_email: 'testuser',
          password: 'password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        message: 'Login successful',
        user: { user_id: 1 },
        token: 'mockToken',
      });
      expect(authenticateLogin).toHaveBeenCalledWith('testuser', 'password123');
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 1 },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
    });

    it('should return 401 if authentication fails', async () => {
      authenticateLogin.mockResolvedValueOnce([]);

      const res = await request(app)
        .post('/api/users/login')
        .send({
          username_or_email: 'testuser',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ message: 'Invalid username, email or password' });
    });

    it('should return 500 if an error occurs', async () => {
      authenticateLogin.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app)
        .post('/api/users/login')
        .send({
          username_or_email: 'testuser',
          password: 'password123',
        });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('GET /categories/:type', () => {
    it('should return categories for the given type', async () => {
      getCategories.mockResolvedValueOnce([{ id: 1, name: 'Food' }]);

      const res = await request(app).get('/api/categories/expense');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([{ id: 1, name: 'Food' }]);
      expect(getCategories).toHaveBeenCalledWith('expense');
    });

    it('should return 500 if an error occurs', async () => {
      getCategories.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get('/api/categories/expense');

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('GET /users/find/username/:value', () => {
    it('should return users matching the username', async () => {
      findUserByUsername.mockResolvedValueOnce([{ id: 1, username: 'testuser' }]);

      const res = await request(app).get('/api/users/find/username/testuser');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([{ id: 1, username: 'testuser' }]);
      expect(findUserByUsername).toHaveBeenCalledWith('testuser');
    });

    it('should return 500 if an error occurs', async () => {
      findUserByUsername.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get('/api/users/find/username/testuser');

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('GET /users/find/email/:value', () => {
    it('should return users matching the email', async () => {
      findUserByEmail.mockResolvedValueOnce([{ id: 1, email: 'test@example.com' }]);

      const res = await request(app).get('/api/users/find/email/test@example.com');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([{ id: 1, email: 'test@example.com' }]);
      expect(findUserByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return 500 if an error occurs', async () => {
      findUserByEmail.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get('/api/users/find/email/test@example.com');

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('POST /transactions/:userID', () => {
    it('should log a transaction and return the transaction ID', async () => {
      jwt.verify.mockImplementation((token, secret, callback) => callback(null, { userId: 1 }));
      logTransaction.mockResolvedValueOnce({ transaction_id: 123 });

      const res = await request(app)
        .post('/api/transactions/1')
        .set('Authorization', 'Bearer validToken')
        .send({ amount: 100, description: 'Test transaction' });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        message: 'Transaction logged successfully',
        transaction_id: 123,
      });
      expect(logTransaction).toHaveBeenCalledWith({ amount: 100, description: 'Test transaction' }, '1');
    });

    it('should return 500 if an error occurs', async () => {
      jwt.verify.mockImplementation((token, secret, callback) => callback(null, { userId: 1 }));
      logTransaction.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app)
        .post('/api/transactions/1')
        .set('Authorization', 'Bearer validToken')
        .send({ amount: 100, description: 'Test transaction' });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to log transaction' });
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app)
        .post('/api/transactions/1')
        .send({ amount: 100, description: 'Test transaction' });

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('POST /transaction/delete/:id', () => {
    it('should delete a transaction and return the inserted rows', async () => {
      deleteTransaction.mockResolvedValueOnce(1);

      const res = await request(app)
        .post('/api/transaction/delete/1')
        .set('Authorization', 'Bearer validToken')
        .send({ repeatDelete: true, date: '2023-10-01' });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        message: 'Deleted transaction(s) successfully.',
        inserted_rows: 1,
      });
      expect(deleteTransaction).toHaveBeenCalledWith('1', true, '2023-10-01');
    });

    it('should return 500 if an error occurs', async () => {
      deleteTransaction.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app)
        .post('/api/transaction/delete/1')
        .set('Authorization', 'Bearer validToken')
        .send({ repeatDelete: true, date: '2023-10-01' });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to delete the transaction(s).' });
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app)
        .post('/api/transaction/delete/1')
        .send({ repeatDelete: true, date: '2023-10-01' });

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('GET /transaction/:id', () => {
    it('should return a transaction by ID', async () => {
      getTransaction.mockResolvedValueOnce({ id: 1, amount: 100, description: 'Test transaction' });

      const res = await request(app).get('/api/transaction/1').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ id: 1, amount: 100, description: 'Test transaction' });
      expect(getTransaction).toHaveBeenCalledWith('1');
    });

    it('should return 500 if an error occurs', async () => {
      getTransaction.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get('/api/transaction/1').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(500);
      expect(res.text).toBe('Error fetching transaction 1');
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/transaction/1');

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('POST /transactions/update/:updateOption/:transID', () => {
    it('should update a transaction and return the transaction ID', async () => {
      updateTransaction.mockResolvedValueOnce({ transaction_id: 1 });

      const res = await request(app)
        .post('/api/transactions/update/replace/1')
        .set('Authorization', 'Bearer validToken')
        .send({ amount: 200, description: 'Updated transaction' });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        message: 'Transaction updated successfully',
        transaction_id: 1,
      });
      expect(updateTransaction).toHaveBeenCalledWith(
        { amount: 200, description: 'Updated transaction' },
        '1',
        'replace'
      );
    });

    it('should return 500 if an error occurs', async () => {
      updateTransaction.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app)
        .post('/api/transactions/update/replace/1')
        .set('Authorization', 'Bearer validToken')
        .send({ amount: 200, description: 'Updated transaction' });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to update transaction' });
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app)
        .post('/api/transactions/update/replace/1')
        .send({ amount: 200, description: 'Updated transaction' });

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('POST /budget/:userID', () => {
    it('should save a budget and return the inserted rows', async () => {
      jwt.verify.mockImplementation((token, secret, callback) => callback(null, { userId: 1 }));
      setBudget.mockResolvedValueOnce(5);

      const res = await request(app)
        .post('/api/budget/1')
        .set('Authorization', 'Bearer validToken')
        .send({ category: 'Food', amount: 500 });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        message: 'Budget saved successfully',
        inserted_rows: 5,
      });
      expect(setBudget).toHaveBeenCalledWith({ category: 'Food', amount: 500 }, '1');
    });

    it('should return 500 if an error occurs', async () => {
      jwt.verify.mockImplementation((token, secret, callback) => callback(null, { userId: 1 }));
      setBudget.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app)
        .post('/api/budget/1')
        .set('Authorization', 'Bearer validToken')
        .send({ category: 'Food', amount: 500 });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to save budget' });
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app)
        .post('/api/budget/1')
        .send({ category: 'Food', amount: 500 });

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('GET /budget/:userID', () => {
    it('should return the budget for the given user ID', async () => {
      getBudget.mockResolvedValueOnce([{ id: 1, category: 'Food', amount: 500 }]);

      const res = await request(app).get('/api/budget/1').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([{ id: 1, category: 'Food', amount: 500 }]);
      expect(getBudget).toHaveBeenCalledWith('1');
    });

    it('should return 500 if an error occurs', async () => {
      getBudget.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get('/api/budget/1').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(500);
      expect(res.text).toBe('Error fetching budget');
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/budget/1');

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('POST /budget/delete/:userID', () => {
    it('should delete budget categories and return the inserted rows', async () => {
      jwt.verify.mockImplementation((token, secret, callback) => callback(null, { userId: 1 }));
      deleteCategories.mockResolvedValueOnce(3);

      const res = await request(app)
        .post('/api/budget/delete/1')
        .set('Authorization', 'Bearer validToken')
        .send([{ category: 'Food' }]);

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        message: 'Budget categories deleted successfully',
        inserted_rows: 3,
      });
      expect(deleteCategories).toHaveBeenCalledWith([{ category: 'Food' }], '1');
    });

    it('should return 500 if an error occurs', async () => {
      jwt.verify.mockImplementation((token, secret, callback) => callback(null, { userId: 1 }));
      deleteCategories.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app)
        .post('/api/budget/delete/1')
        .set('Authorization', 'Bearer validToken')
        .send([{ category: 'Food' }]);

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to delete budget categories' });
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app)
        .post('/api/budget/delete/1')
        .send([{ category: 'Food' }]);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('GET /budget/total/:userID', () => {
    it('should return the monthly budget total for the given user ID', async () => {
      getMonthlyBudget.mockResolvedValueOnce({ total: 1000 });

      const res = await request(app).get('/api/budget/total/1').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ total: 1000 });
      expect(getMonthlyBudget).toHaveBeenCalledWith('1');
    });

    it('should return 500 if an error occurs', async () => {
      getMonthlyBudget.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get('/api/budget/total/1').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(500);
      expect(res.text).toBe('Error fetching monthly budget total');
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/budget/total/1');

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('GET /spent/month/:userID', () => {
    it('should return the monthly spend for the given user ID', async () => {
      getMonthlySpend.mockResolvedValueOnce({ total: 500 });

      const res = await request(app).get('/api/spent/month/1').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ total: 500 });
      expect(getMonthlySpend).toHaveBeenCalledWith('1');
    });

    it('should return 500 if an error occurs', async () => {
      getMonthlySpend.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get('/api/spent/month/1').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(500);
      expect(res.text).toBe('Error fetching monthly budget total');
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/spent/month/1');

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('GET /transactions/spent/:userID/:category/:type', () => {
    it('should return the monthly spend for a category and type', async () => {
      getMonthlySpendByCategory.mockResolvedValueOnce({ total: 300 });

      const res = await request(app)
        .get('/api/transactions/spent/1/Food/expense')
        .set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ total: 300 });
      expect(getMonthlySpendByCategory).toHaveBeenCalledWith('1', 'Food', 'expense');
    });

    it('should return 500 if an error occurs', async () => {
      getMonthlySpendByCategory.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app)
        .get('/api/transactions/spent/1/Food/expense')
        .set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(500);
      expect(res.text).toBe('Error fetching category spending total');
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/transactions/spent/1/Food/expense');

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('POST /savings-goal/:userID', () => {
    it('should save a savings goal and return the inserted rows', async () => {
      jwt.verify.mockImplementation((token, secret, callback) => callback(null, { userId: 1 }));
      setSavingsGoal.mockResolvedValueOnce(1);

      const res = await request(app)
        .post('/api/savings-goal/1')
        .set('Authorization', 'Bearer validToken')
        .send({ goal: 'Save $1000', amount: 1000 });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        message: 'Savings goal saved successfully',
        inserted_rows: 1,
      });
      expect(setSavingsGoal).toHaveBeenCalledWith({ goal: 'Save $1000', amount: 1000 }, '1');
    });

    it('should return 500 if an error occurs', async () => {
      jwt.verify.mockImplementation((token, secret, callback) => callback(null, { userId: 1 }));
      setSavingsGoal.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app)
        .post('/api/savings-goal/1')
        .set('Authorization', 'Bearer validToken')
        .send({ goal: 'Save $1000', amount: 1000 });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to save savings goal' });
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app)
        .post('/api/savings-goal/1')
        .send({ goal: 'Save $1000', amount: 1000 });

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('POST /savings-goals/delete/:goalID', () => {
    it('should delete a savings goal and return the inserted rows', async () => {
      deleteGoal.mockResolvedValueOnce(1);

      const res = await request(app)
        .post('/api/savings-goals/delete/1')
        .set('Authorization', 'Bearer validToken')
        .send({ userID: 1 });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        message: 'Deleted goal successfully.',
        inserted_rows: 1,
      });
      expect(deleteGoal).toHaveBeenCalledWith('1', 1);
    });

    it('should return 500 if an error occurs', async () => {
      deleteGoal.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app)
        .post('/api/savings-goals/delete/1')
        .set('Authorization', 'Bearer validToken')
        .send({ userID: 1 });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to delete the savings goal.' });
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app)
        .post('/api/savings-goals/delete/1')
        .send({ userID: 1 });

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('GET /savings-goal/:id', () => {
    it('should return a savings goal by ID', async () => {
      getSavingsGoal.mockResolvedValueOnce({ id: 1, goal: 'Save $1000', amount: 1000 });

      const res = await request(app).get('/api/savings-goal/1').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ id: 1, goal: 'Save $1000', amount: 1000 });
      expect(getSavingsGoal).toHaveBeenCalledWith('1');
    });

    it('should return 500 if an error occurs', async () => {
      getSavingsGoal.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get('/api/savings-goal/1').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(500);
      expect(res.text).toBe('Error fetching goal 1');
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/savings-goal/1');

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('POST /savings-goal/update/:goalID', () => {
    it('should update a savings goal and return the inserted rows', async () => {
      updateSavingsGoal.mockResolvedValueOnce(1);

      const res = await request(app)
        .post('/api/savings-goal/update/1')
        .set('Authorization', 'Bearer validToken')
        .send({ goal: 'Save $2000', amount: 2000 });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        message: 'Savings goal saved successfully',
        inserted_rows: 1,
      });
      expect(updateSavingsGoal).toHaveBeenCalledWith({ goal: 'Save $2000', amount: 2000 }, '1');
    });

    it('should return 500 if an error occurs', async () => {
      updateSavingsGoal.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app)
        .post('/api/savings-goal/update/1')
        .set('Authorization', 'Bearer validToken')
        .send({ goal: 'Save $2000', amount: 2000 });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to save savings goal' });
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app)
        .post('/api/savings-goal/update/1')
        .send({ goal: 'Save $2000', amount: 2000 });

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('GET /balance/:userID', () => {
    it('should return the balance for the given user ID', async () => {
      getBalance.mockResolvedValueOnce({ balance: 1000 });

      const res = await request(app).get('/api/balance/1').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ balance: 1000 });
      expect(getBalance).toHaveBeenCalledWith('1');
    });

    it('should return 500 if an error occurs', async () => {
      getBalance.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get('/api/balance/1').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(500);
      expect(res.text).toBe('Error fetching bank balance');
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/balance/1');

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('GET /balance/:userID/:type', () => {
    it('should return the total balance for the given type', async () => {
      getTotalByType.mockResolvedValueOnce({ total: 500 });

      const res = await request(app).get('/api/balance/1/savings').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ total: 500 });
      expect(getTotalByType).toHaveBeenCalledWith('1', 'savings');
    });

    it('should return 500 if an error occurs', async () => {
      getTotalByType.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get('/api/balance/1/savings').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(500);
      expect(res.text).toBe('Error fetching total balance for savings');
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/balance/1/savings');

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('GET /transactions/:userID/past/:type', () => {
    it('should return past transactions for the given type', async () => {
      getPastTransactions.mockResolvedValueOnce([{ id: 1, amount: 100, type: 'expense' }]);

      const res = await request(app).get('/api/transactions/1/past/expense').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([{ id: 1, amount: 100, type: 'expense' }]);
      expect(getPastTransactions).toHaveBeenCalledWith('1', 'expense');
    });

    it('should return 500 if an error occurs', async () => {
      getPastTransactions.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get('/api/transactions/1/past/expense').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(500);
      expect(res.text).toBe('Error fetching past expense transactions');
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/transactions/1/past/expense');

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('GET /transactions/:userID/upcoming/:type', () => {
    it('should return upcoming transactions for the given type', async () => {
      getUpcomingTransactions.mockResolvedValueOnce([{ id: 1, amount: 200, type: 'income' }]);

      const res = await request(app).get('/api/transactions/1/upcoming/income').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([{ id: 1, amount: 200, type: 'income' }]);
      expect(getUpcomingTransactions).toHaveBeenCalledWith('1', 'income');
    });

    it('should return 500 if an error occurs', async () => {
      getUpcomingTransactions.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get('/api/transactions/1/upcoming/income').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(500);
      expect(res.text).toBe('Error fetching upcoming income transactions');
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/transactions/1/upcoming/income');

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('GET /transactions/outgoings/:userID', () => {
    it('should return the total outgoings for the given user ID', async () => {
      getTotalOutgoings.mockResolvedValueOnce({ total: 800 });

      const res = await request(app).get('/api/transactions/outgoings/1').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ total: 800 });
      expect(getTotalOutgoings).toHaveBeenCalledWith('1');
    });

    it('should return 500 if an error occurs', async () => {
      getTotalOutgoings.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get('/api/transactions/outgoings/1').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(500);
      expect(res.text).toBe('Error fetching total outgoings');
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/transactions/outgoings/1');

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('GET /transactions/total-income/:userID', () => {
    it('should return the total income for the given user ID', async () => {
      getTotalIncome.mockResolvedValueOnce({ total: 1500 });

      const res = await request(app).get('/api/transactions/total-income/1').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ total: 1500 });
      expect(getTotalIncome).toHaveBeenCalledWith('1');
    });

    it('should return 500 if an error occurs', async () => {
      getTotalIncome.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get('/api/transactions/total-income/1').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(500);
      expect(res.text).toBe('Error fetching total outgoings');
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/transactions/total-income/1');

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('GET /savings-goals/total-goal/:userID', () => {
    it('should return the total savings goal amount for the given user ID', async () => {
      getTotalGoalAmount.mockResolvedValueOnce({ total: 5000 });

      const res = await request(app).get('/api/savings-goals/total-goal/1').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ total: 5000 });
      expect(getTotalGoalAmount).toHaveBeenCalledWith('1');
    });

    it('should return 500 if an error occurs', async () => {
      getTotalGoalAmount.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get('/api/savings-goals/total-goal/1').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(500);
      expect(res.text).toBe('Error fetching total outgoings');
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/savings-goals/total-goal/1');

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('GET /transactions/:userID/week/:transType', () => {
    it('should return weekly transactions for the given type and user ID', async () => {
      getWeeklyCats.mockResolvedValueOnce([{ id: 1, category: 'Food', amount: 100 }]);

      const res = await request(app).get('/api/transactions/1/week/expense').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([{ id: 1, category: 'Food', amount: 100 }]);
      expect(getWeeklyCats).toHaveBeenCalledWith('1', 'expense');
    });

    it('should return 500 if an error occurs', async () => {
      getWeeklyCats.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get('/api/transactions/1/week/expense').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(500);
      expect(res.text).toBe('Error fetching total outgoings');
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/transactions/1/week/expense');

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('GET /transactions/:userID/month/:transType', () => {
    it('should return monthly transactions for the given type and user ID', async () => {
      getMonthlyCats.mockResolvedValueOnce([{ id: 1, category: 'Rent', amount: 1200 }]);

      const res = await request(app).get('/api/transactions/1/month/expense').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([{ id: 1, category: 'Rent', amount: 1200 }]);
      expect(getMonthlyCats).toHaveBeenCalledWith('1', 'expense');
    });

    it('should return 500 if an error occurs', async () => {
      getMonthlyCats.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get('/api/transactions/1/month/expense').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(500);
      expect(res.text).toBe('Error fetching total outgoings');
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/transactions/1/month/expense');

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('GET /transactions/:userID/year/:transType', () => {
    it('should return yearly transactions for the given type and user ID', async () => {
      getYearlyCats.mockResolvedValueOnce([{ id: 1, category: 'Salary', amount: 50000 }]);

      const res = await request(app).get('/api/transactions/1/year/income').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([{ id: 1, category: 'Salary', amount: 50000 }]);
      expect(getYearlyCats).toHaveBeenCalledWith('1', 'income');
    });

    it('should return 500 if an error occurs', async () => {
      getYearlyCats.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get('/api/transactions/1/year/income').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(500);
      expect(res.text).toBe('Error fetching total outgoings');
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/transactions/1/year/income');

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('GET /transactions/:userID/timeseries/week', () => {
    it('should return weekly timeseries data for the given user ID', async () => {
      getWeeklySeries.mockResolvedValueOnce([{ week: '2023-W40', total: 500 }]);

      const res = await request(app).get('/api/transactions/1/timeseries/week').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([{ week: '2023-W40', total: 500 }]);
      expect(getWeeklySeries).toHaveBeenCalledWith('1');
    });

    it('should return 500 if an error occurs', async () => {
      getWeeklySeries.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get('/api/transactions/1/timeseries/week').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(500);
      expect(res.text).toBe('Error fetching total outgoings');
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/transactions/1/timeseries/week');

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('GET /transactions/:userID/timeseries/month', () => {
    it('should return monthly timeseries data for the given user ID', async () => {
      getMonthlySeries.mockResolvedValueOnce([{ month: '2023-10', total: 2000 }]);

      const res = await request(app).get('/api/transactions/1/timeseries/month').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([{ month: '2023-10', total: 2000 }]);
      expect(getMonthlySeries).toHaveBeenCalledWith('1');
    });

    it('should return 500 if an error occurs', async () => {
      getMonthlySeries.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get('/api/transactions/1/timeseries/month').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(500);
      expect(res.text).toBe('Error fetching total outgoings');
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/transactions/1/timeseries/month');

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('GET /transactions/:userID/timeseries/year', () => {
    it('should return yearly timeseries data for the given user ID', async () => {
      getYearlySeries.mockResolvedValueOnce([{ year: '2023', total: 24000 }]);

      const res = await request(app).get('/api/transactions/1/timeseries/year').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([{ year: '2023', total: 24000 }]);
      expect(getYearlySeries).toHaveBeenCalledWith('1');
    });

    it('should return 500 if an error occurs', async () => {
      getYearlySeries.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get('/api/transactions/1/timeseries/year').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(500);
      expect(res.text).toBe('Error fetching total outgoings');
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/transactions/1/timeseries/year');

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('GET /transactions/:userID/expenses/week', () => {
    it('should return weekly expenses for the given user ID', async () => {
      getWeeklyExpenses.mockResolvedValueOnce([{ week: '2023-W40', total: 300 }]);

      const res = await request(app).get('/api/transactions/1/expenses/week').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([{ week: '2023-W40', total: 300 }]);
      expect(getWeeklyExpenses).toHaveBeenCalledWith('1');
    });

    it('should return 500 if an error occurs', async () => {
      getWeeklyExpenses.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get('/api/transactions/1/expenses/week').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(500);
      expect(res.text).toBe('Error fetching total outgoings');
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/transactions/1/expenses/week');

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('GET /transactions/:userID/expenses/month', () => {
    it('should return monthly expenses for the given user ID', async () => {
      getMonthlyExpenses.mockResolvedValueOnce([{ month: '2023-10', total: 1200 }]);

      const res = await request(app).get('/api/transactions/1/expenses/month').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([{ month: '2023-10', total: 1200 }]);
      expect(getMonthlyExpenses).toHaveBeenCalledWith('1');
    });

    it('should return 500 if an error occurs', async () => {
      getMonthlyExpenses.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get('/api/transactions/1/expenses/month').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(500);
      expect(res.text).toBe('Error fetching total outgoings');
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/transactions/1/expenses/month');

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('GET /transactions/:userID/expenses/year', () => {
    it('should return yearly expenses for the given user ID', async () => {
      getYearlyExpenses.mockResolvedValueOnce([{ year: '2023', total: 14400 }]);

      const res = await request(app).get('/api/transactions/1/expenses/year').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([{ year: '2023', total: 14400 }]);
      expect(getYearlyExpenses).toHaveBeenCalledWith('1');
    });

    it('should return 500 if an error occurs', async () => {
      getYearlyExpenses.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get('/api/transactions/1/expenses/year').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(500);
      expect(res.text).toBe('Error fetching total outgoings');
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/transactions/1/expenses/year');

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('GET /savings-goals/:userID', () => {
    it('should return savings goals for the given user ID', async () => {
      getSavingsGoals.mockResolvedValueOnce([{ id: 1, goal: 'Save $5000', amount: 5000 }]);

      const res = await request(app).get('/api/savings-goals/1').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([{ id: 1, goal: 'Save $5000', amount: 5000 }]);
      expect(getSavingsGoals).toHaveBeenCalledWith('1');
    });

    it('should return 500 if an error occurs', async () => {
      getSavingsGoals.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app).get('/api/savings-goals/1').set('Authorization', 'Bearer validToken');

      expect(res.statusCode).toBe(500);
      expect(res.text).toBe('Error fetching savings goals');
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/savings-goals/1');

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('POST /savings-goals/update', () => {
    it('should update goal rankings and return the inserted rows', async () => {
      updateGoalRankings.mockResolvedValueOnce(3);

      const res = await request(app)
        .post('/api/savings-goals/update')
        .set('Authorization', 'Bearer validToken')
        .send([{ id: 1, rank: 1 }, { id: 2, rank: 2 }]);

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        message: 'Goal rankings saved successfully',
        inserted_rows: 3,
      });
      expect(updateGoalRankings).toHaveBeenCalledWith([{ id: 1, rank: 1 }, { id: 2, rank: 2 }]);
    });

    it('should return 500 if an error occurs', async () => {
      updateGoalRankings.mockRejectedValueOnce(new Error('Database error'));

      const res = await request(app)
        .post('/api/savings-goals/update')
        .set('Authorization', 'Bearer validToken')
        .send([{ id: 1, rank: 1 }, { id: 2, rank: 2 }]);

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to save goal rankings' });
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app)
        .post('/api/savings-goals/update')
        .send([{ id: 1, rank: 1 }, { id: 2, rank: 2 }]);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: 'Access token required' });
    });
  });
});

// Integration Tests
describe('Database Routes - Integration Tests', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown-route');
    expect(res.statusCode).toBe(404);
  });

  it('should handle CORS preflight requests', async () => {
    const res = await request(app)
      .options('/api/users/register')
      .set('Access-Control-Request-Method', 'POST')
      .set('Origin', 'http://example.com');

    expect(res.statusCode).toBe(200);
  });
});