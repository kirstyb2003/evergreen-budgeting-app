const { setBudget, getBudget, deleteCategories, getMonthlyBudget } = require('../database-queries/budget');
const pool = require('../pool');
const { getCategoryID } = require('../database-queries/categories');
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const dbRoutes = require('../database-routes');

jest.mock('../pool');
jest.mock('../database-queries/categories');
jest.mock('jsonwebtoken');

const app = express();
app.use(express.json());
app.use('/api', dbRoutes);

// Unit Tests
describe('setBudget', () => {
    it('should insert or update budget entries', async () => {
        getCategoryID.mockResolvedValue({ category_id: 1 });
        pool.query.mockResolvedValue({ rows: [{ budget_id: 1 }] });

        const budgetData = [{ category: 'Food', amount: 200, category_type: 'expense' }];
        const result = await setBudget(budgetData, 1);

        expect(getCategoryID).toHaveBeenCalledWith('Food', 'expense');
        expect(pool.query).toHaveBeenCalledWith(expect.any(String), [1, 1, 200]);
        expect(result).toEqual([{ budget_id: 1 }]);
    });

    it('should return 404 if category is not found', async () => {
        getCategoryID.mockResolvedValue(null);

        const budgetData = [{ category: 'Unknown', amount: 100, category_type: 'expense' }];
        await expect(setBudget(budgetData, 1)).rejects.toThrow();
    });
});

describe('getBudget', () => {
    it('should retrieve budget entries for a user', async () => {
        pool.query.mockResolvedValue({ rows: [{ amount: 200, category_type: 'expense', name: 'Food' }] });

        const result = await getBudget(1);

        expect(pool.query).toHaveBeenCalledWith(expect.any(String), [1]);
        expect(result).toEqual([{ amount: 200, category_type: 'expense', name: 'Food' }]);
    });
});

describe('deleteCategories', () => {
    it('should delete budget entries for specified categories', async () => {
        getCategoryID.mockResolvedValue({ category_id: 1 });
        pool.query.mockResolvedValue({ rows: [{}] });

        const deleteCats = [{ name: 'Food', type: 'expense' }];
        const result = await deleteCategories(deleteCats, 1);

        expect(getCategoryID).toHaveBeenCalledWith('Food', 'expense');
        expect(pool.query).toHaveBeenCalledWith(expect.any(String), [1, 1]);
        expect(result).toEqual([{}]);
    });

    it('should throw an error if category ID is not found', async () => {
        getCategoryID.mockResolvedValue(null);

        const deleteCats = [{ name: 'NonexistentCategory', type: 'expense' }];
        const userID = 1;

        await expect(deleteCategories(deleteCats, userID)).rejects.toThrowError(
            `Category, NonexistentCategory, not found`
        );

        expect(getCategoryID).toHaveBeenCalledWith('NonexistentCategory', 'expense');
    });
});

describe('getMonthlyBudget', () => {
    it('should calculate the total monthly budget for a user', async () => {
        pool.query.mockResolvedValue({ rows: [{ total: '500.00' }] });

        const result = await getMonthlyBudget(1);

        expect(pool.query).toHaveBeenCalledWith(expect.any(String), [1]);
        expect(result).toBe(500.00);
    });

    it('should return 0.00 if no budget exists', async () => {
        pool.query.mockResolvedValue({ rows: [{}] });

        const result = await getMonthlyBudget(1);

        expect(result).toBe(0.00);
    });
});