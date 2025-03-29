const {
  setSavingsGoal,
  getSavingsGoals,
  updateGoalRankings,
  deleteGoal,
  getSavingsGoal,
  updateSavingsGoal,
  getTotalGoalAmount,
} = require('../database-queries/savings_goal');
const pool = require('../pool');

jest.mock('../pool');

describe('Savings Goal Queries', () => {
  describe('setSavingsGoal', () => {
    it('should insert a new savings goal and return the goal ID', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ goal_count: 0 }] })
        .mockResolvedValueOnce({ rows: [{ goal_id: 1 }] });

      const req = { name: 'Save for Car', target_amount: 5000, starting_amount: 1000 };
      const result = await setSavingsGoal(req, 1);

      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(result).toEqual([{ goal_id: 1 }]);
    });

    it('should throw an error if the query fails', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const req = { name: 'Save for Car', target_amount: 5000, starting_amount: 1000 };
      await expect(setSavingsGoal(req, 1)).rejects.toThrow('Database error');
    });

    it('should format the goal_date if provided', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ goal_count: 0 }] })
        .mockResolvedValueOnce({ rows: [{ goal_id: 1 }] });

      const req = { name: 'Save for Car', target_amount: 5000, starting_amount: 1000, goal_date: '2023-10-15' };
      const result = await setSavingsGoal(req, 1);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO savings_goal'),
        [1, 'Save for Car', 5000, 1000, '2023-10-15', 1]
      );
      expect(result).toEqual([{ goal_id: 1 }]);
    });

    it('should handle null goal_date if not provided', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ goal_count: 0 }] })
        .mockResolvedValueOnce({ rows: [{ goal_id: 1 }] });

      const req = { name: 'Save for Car', target_amount: 5000, starting_amount: 1000 };
      const result = await setSavingsGoal(req, 1);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO savings_goal'),
        [1, 'Save for Car', 5000, 1000, null, 1]
      );
      expect(result).toEqual([{ goal_id: 1 }]);
    });
  });

  describe('getSavingsGoals', () => {
    it('should retrieve all savings goals for a user', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ goal_id: 1, name: 'Save for Car', goal_amount: 5000 }],
      });

      const result = await getSavingsGoals(1);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [1]);
      expect(result).toEqual([{ goal_id: 1, name: 'Save for Car', goal_amount: 5000 }]);
    });

    it('should throw an error if the query fails', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      await expect(getSavingsGoals(1)).rejects.toThrow('Database error');
    });
  });

  describe('updateGoalRankings', () => {
    it('should update rankings for multiple goals', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const req = [
        { goal_id: 1, ranking: 1 },
        { goal_id: 2, ranking: 2 },
      ];
      const result = await updateGoalRankings(req);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [1, 1, 2, 2]);
      expect(result).toEqual([]);
    });

    it('should throw an error if the query fails', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const req = [{ goal_id: 1, ranking: 1 }];
      await expect(updateGoalRankings(req)).rejects.toThrow('Database error');
    });

    it('should return early if the request array is empty', async () => {
      const req = [];
      const result = await updateGoalRankings(req);

      expect(result).toBeUndefined();
    });
  });

  describe('deleteGoal', () => {
    it('should rollback if an error occurs', async () => {
      pool.query.mockResolvedValueOnce().mockRejectedValueOnce(new Error('Database error'));

      await expect(deleteGoal(1, 1)).rejects.toThrow('Database error');
      expect(pool.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('getSavingsGoal', () => {
    it('should retrieve a savings goal by ID', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ name: 'Save for Car', goal_amount: 5000 }],
      });

      const result = await getSavingsGoal(1);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [1]);
      expect(result).toEqual({ name: 'Save for Car', goal_amount: 5000 });
    });

    it('should throw an error if the query fails', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      await expect(getSavingsGoal(1)).rejects.toThrow('Database error');
    });
  });

  describe('updateSavingsGoal', () => {
    it('should update a savings goal and return the updated rows', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const goalData = { name: 'Save for Vacation', target_amount: 3000, starting_amount: 500 };
      const result = await updateSavingsGoal(goalData, 1);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [
        3000,
        500,
        null,
        'Save for Vacation',
        1,
      ]);
      expect(result).toEqual([]);
    });

    it('should throw an error if the query fails', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const goalData = { name: 'Save for Vacation', target_amount: 3000, starting_amount: 500 };
      await expect(updateSavingsGoal(goalData, 1)).rejects.toThrow('Database error');
    });
  });

  describe('getTotalGoalAmount', () => {
    it('should return the total goal and starting amounts for a user', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ total_goal: '5000.00', total_starting: '1000.00' }],
      });

      const result = await getTotalGoalAmount(1);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [1]);
      expect(result).toEqual({ total_goal: 5000.0, total_starting: 1000.0 });
    });

    it('should return 0.00 for totals if no data exists', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{}] });

      const result = await getTotalGoalAmount(1);

      expect(result).toEqual({ total_goal: 0.0, total_starting: 0.0 });
    });
  });
});
