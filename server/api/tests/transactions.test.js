const { logTransaction, getBalance, getTotalByType, getPastTransactions, getUpcomingTransactions, deleteTransaction, getTransaction, updateTransaction, getMonthlySpend, getMonthlySpendByCategory, getTotalOutgoings, getTotalIncome, getWeeklyCats, getMonthlyCats, getYearlyCats, getWeeklySeries, getMonthlySeries, getYearlySeries, getWeeklyExpenses, getMonthlyExpenses, getYearlyExpenses } = require('../database-queries/transactions');
const pool = require('../pool');

jest.mock('../pool');

describe('transactions.js', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('logTransaction', () => {
    it('should insert a transaction and return the transaction ID', async () => {
      const mockTransactionData = {
        type: 'expense',
        category: 'Food',
        name: 'Groceries',
        transaction_date: '2023-10-01',
        amount: 50,
        repeat: false,
      };
      const mockUserID = 'user123';
      const mockDates = ['2023-10-01'];
      const mockReq = { transactionData: mockTransactionData, dates: mockDates };

      pool.query.mockResolvedValueOnce({ rows: [{ category_id: 1 }] });
      pool.query.mockResolvedValueOnce({ rows: [{ transaction_id: 'trans123' }] });

      const result = await logTransaction(mockReq, mockUserID);

      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(result).toEqual([{ transaction_id: 'trans123' }]);
    });

    it('should handle the case where req does not have transactionData', async () => {
      const mockTransactionData = {
        type: 'expense',
        category: 'Food',
        name: 'Groceries',
        transaction_date: '2023-10-01',
        amount: 50,
        dates: ['2023-10-01'],
      };
      const mockUserID = 'user123';
  
      pool.query.mockResolvedValueOnce({ rows: [{ category_id: 1 }] });
      pool.query.mockResolvedValueOnce({ rows: [{ transaction_id: 'trans123' }] });
  
      const result = await logTransaction(mockTransactionData, mockUserID);
  
      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(result).toEqual([{ transaction_id: 'trans123' }]);
    });
  
    it('should generate a repeatGroupId when repeat is true', async () => {
      const mockTransactionData = {
        type: 'expense',
        category: 'Food',
        name: 'Groceries',
        transaction_date: '2023-10-01',
        amount: 50,
        repeat: true,
        dates: ['2023-10-01'],
      };
      const mockUserID = 'user123';
  
      pool.query.mockResolvedValueOnce({ rows: [{ category_id: 1 }] });
      pool.query.mockResolvedValueOnce({ rows: [{ transaction_id: 'trans123' }] });
  
      const result = await logTransaction({ transactionData: mockTransactionData, dates: mockTransactionData.dates }, mockUserID);
  
      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(result).toEqual([{ transaction_id: 'trans123' }]);
    });
  
    it('should handle end_date conversion to ISO string', async () => {
      const mockTransactionData = {
        type: 'expense',
        category: 'Food',
        name: 'Groceries',
        transaction_date: '2023-10-01',
        amount: 50,
        repeat: false,
        end_date: '2023-12-31',
        dates: ['2023-10-01'],
      };
      const mockUserID = 'user123';
  
      pool.query.mockResolvedValueOnce({ rows: [{ category_id: 1 }] });
      pool.query.mockResolvedValueOnce({ rows: [{ transaction_id: 'trans123' }] });
  
      const result = await logTransaction({ transactionData: mockTransactionData, dates: mockTransactionData.dates }, mockUserID);
  
      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(result).toEqual([{ transaction_id: 'trans123' }]);
    });
  
    it('should log an error and throw when the query fails', async () => {
      const mockTransactionData = {
        type: 'expense',
        category: 'Food',
        name: 'Groceries',
        transaction_date: '2023-10-01',
        amount: 50,
        dates: ['2023-10-01'],
      };
      const mockUserID = 'user123';
  
      pool.query.mockResolvedValueOnce({ rows: [{ category_id: 1 }] });
      pool.query.mockRejectedValueOnce(new Error('Database error'));
  
      await expect(logTransaction({ transactionData: mockTransactionData, dates: mockTransactionData.dates }, mockUserID))
        .rejects.toThrow('Database error');
  
      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(console.error).toHaveBeenCalledWith('Error inserting transactions: ', expect.any(Error));
    });
  });

  describe('getBalance', () => {
    it('should calculate the user balance correctly', async () => {
      const mockUserID = 'user123';

      pool.query
        .mockResolvedValueOnce({ rows: [{ total: 1000 }] })
        .mockResolvedValueOnce({ rows: [{ total: 500 }] })
        .mockResolvedValueOnce({ rows: [{ total: 200 }] })
        .mockResolvedValueOnce({ rows: [{ starting_balance: 300 }] }); 

      const result = await getBalance(mockUserID);

      expect(pool.query).toHaveBeenCalledTimes(4);
      expect(result).toBe('600.00');
    });
  });

  describe('getTotalByType', () => {
    it('should return the total amount for a given type', async () => {
      const mockUserID = 'user123';
      const mockType = 'income';

      pool.query.mockResolvedValueOnce({ rows: [{ total: 1000 }] });

      const result = await getTotalByType(mockUserID, mockType);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockUserID, mockType]);
      expect(result).toBe(1000);
    });
  });

  describe('deleteTransaction', () => {
    it('should delete a single transaction', async () => {
      const mockTransactionID = 'trans123';

      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await deleteTransaction(mockTransactionID, 'single');

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockTransactionID]);
      expect(result).toEqual([]);
    });

    it('should delete all transactions in a repeat group', async () => {
      const mockTransactionID = 'trans123';

      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await deleteTransaction(mockTransactionID, 'all');

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockTransactionID]);
      expect(result).toEqual([]);
    });

    it('should delete transactions after a specific date when deleteType is "after"', async () => {
      const mockTransactionID = 'trans123';
      const mockDate = '2023-10-01';

      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await deleteTransaction(mockTransactionID, 'after', mockDate);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockDate, mockTransactionID]);
      expect(result).toEqual([]);
    });

    it('should throw an error if date is not provided for "after" deleteType', async () => {
      const mockTransactionID = 'trans123';

      await expect(deleteTransaction(mockTransactionID, 'after')).rejects.toThrow(
        'Date is required for "after" deleteType'
      );
    });

    it('should default to "single" deleteType when deleteType is null', async () => {
      const mockTransactionID = 'trans123';

      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await deleteTransaction(mockTransactionID, null);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockTransactionID]);
      expect(result).toEqual([]);
    });

    it('should throw an error for an invalid deleteType', async () => {
      const mockTransactionID = 'trans123';

      await expect(deleteTransaction(mockTransactionID, 'invalidType')).rejects.toThrow(
        'Invalid deleteType'
      );
    });
  });

  describe('getTransaction', () => {
    it('should retrieve a transaction by ID', async () => {
      const mockTransactionID = 'trans123';
      const mockTransaction = {
        name: 'Groceries',
        category: 'Food',
        type: 'expense',
        transaction_date: '2023-10-01',
        amount: 50,
      };

      pool.query.mockResolvedValueOnce({ rows: [mockTransaction] });

      const result = await getTransaction(mockTransactionID);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockTransactionID]);
      expect(result).toEqual(mockTransaction);
    });
  });

  describe('updateTransaction', () => {
    it('should update a single transaction', async () => {
      const mockReq = {
        transactionData: {
          type: 'expense',
          category: 'Food',
          name: 'Groceries',
          transaction_date: '2023-10-01',
          amount: 60,
        },
      };
      const mockTransactionID = 'trans123';

      pool.query.mockResolvedValueOnce({ rows: [{ category_id: 1 }] });
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await updateTransaction(mockReq, mockTransactionID, 'single');

      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(result).toEqual([]);
    });
  });

  describe('getMonthlySpend', () => {
    it('should return the total monthly spend', async () => {
      const mockUserID = 'user123';

      pool.query.mockResolvedValueOnce({ rows: [{ total: 500 }] });

      const result = await getMonthlySpend(mockUserID);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockUserID]);
      expect(result).toBe(500);
    });
  });

  describe('getMonthlySpendByCategory', () => {
    it('should return the total monthly spend for a given category and type', async () => {
      const mockUserID = 'user123';
      const mockCategory = 'Food';
      const mockType = 'expense';
      const mockCategoryId = 1;
      const mockTotal = 150;

      pool.query
        .mockResolvedValueOnce({ rows: [{ category_id: mockCategoryId }] }) // Mock category query
        .mockResolvedValueOnce({ rows: [{ total: mockTotal }] }); // Mock transaction query

      const result = await getMonthlySpendByCategory(mockUserID, mockCategory, mockType);

      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockCategory, mockType]); // Category query
      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockCategoryId, mockUserID]); // Transaction query
      expect(result).toBe(mockTotal);
    });

    it('should return 0.00 if no transactions are found for the category', async () => {
      const mockUserID = 'user123';
      const mockCategory = 'Food';
      const mockType = 'expense';
      const mockCategoryId = 1;

      pool.query
        .mockResolvedValueOnce({ rows: [{ category_id: mockCategoryId }] })
        .mockResolvedValueOnce({ rows: [] });

      const result = await getMonthlySpendByCategory(mockUserID, mockCategory, mockType);

      expect(result).toBe(0.00);
    });

    it('should return 0.00 if the category does not exist', async () => {
      const mockUserID = 'user123';
      const mockCategory = 'Nonexistent';
      const mockType = 'expense';

      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await getMonthlySpendByCategory(mockUserID, mockCategory, mockType);

      expect(result).toBe(0.00);
    });
  });

  describe('getPastTransactions', () => {
    it('should retrieve past transactions for a given user and type', async () => {
      const mockUserID = 'user123';
      const mockType = 'expense';
      const mockTransactions = [
        {
          transaction_id: 'trans1',
          name: 'Groceries',
          category: 'Food',
          amount: 50,
          transaction_date: '2023-10-01',
          shop: 'Supermarket',
          payment_method: 'Credit Card',
          repeat: false,
          repeat_schedule: null,
          end_date: null,
          type: 'expense',
        },
      ];

      pool.query.mockResolvedValueOnce({ rows: mockTransactions });

      const result = await getPastTransactions(mockUserID, mockType);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockUserID, mockType]);
      expect(result).toEqual(mockTransactions);
    });

    it('should log an error and throw when the query fails', async () => {
      const mockUserID = 'user123';
      const mockType = 'expense';

      jest.spyOn(console, 'error').mockImplementation(() => {}); // Mock console.error
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      await expect(getPastTransactions(mockUserID, mockType)).rejects.toThrow('Database error');

      expect(console.error).toHaveBeenCalledWith(
        `Error retrieving past ${mockType} transactions: `,
        expect.any(Error)
      );
    });
  });

  describe('getUpcomingTransactions', () => {
    it('should retrieve upcoming transactions for a given user and type', async () => {
      const mockUserID = 'user123';
      const mockType = 'expense';
      const mockTransactions = [
        {
          transaction_id: 'trans2',
          name: 'Rent',
          category: 'Housing',
          amount: 1000,
          transaction_date: '2023-11-01',
          shop: null,
          payment_method: 'Bank Transfer',
          repeat: true,
          repeat_schedule: 'monthly',
          end_date: '2024-11-01',
          type: 'expense',
        },
      ];

      pool.query.mockResolvedValueOnce({ rows: mockTransactions });

      const result = await getUpcomingTransactions(mockUserID, mockType);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockUserID, mockType]);
      expect(result).toEqual(mockTransactions);
    });

    it('should log an error and throw when the query fails', async () => {
      const mockUserID = 'user123';
      const mockType = 'expense';

      jest.spyOn(console, 'error').mockImplementation(() => {}); // Mock console.error
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      await expect(getUpcomingTransactions(mockUserID, mockType)).rejects.toThrow('Database error');

      expect(console.error).toHaveBeenCalledWith(
        `Error retrieving upcoming ${mockType} transactions: `,
        expect.any(Error)
      );
    });
  });

  describe('getTotalOutgoings', () => {
    it('should return the total outgoings for the current month', async () => {
      const mockUserID = 'user123';
      const mockTotal = 750;

      pool.query.mockResolvedValueOnce({ rows: [{ total: mockTotal }] });

      const result = await getTotalOutgoings(mockUserID);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockUserID]);
      expect(result).toBe(mockTotal);
    });

    it('should return 0.00 if there are no outgoings for the current month', async () => {
      const mockUserID = 'user123';

      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await getTotalOutgoings(mockUserID);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockUserID]);
      expect(result).toBe(0.00);
    });
  });

  describe('getTotalIncome', () => {
    it('should return the total income for the current month', async () => {
      const mockUserID = 'user123';
      const mockTotal = 1200;

      pool.query.mockResolvedValueOnce({ rows: [{ total: mockTotal }] });

      const result = await getTotalIncome(mockUserID);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockUserID]);
      expect(result).toBe(mockTotal);
    });

    it('should return 0.00 if there is no income for the current month', async () => {
      const mockUserID = 'user123';

      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await getTotalIncome(mockUserID);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockUserID]);
      expect(result).toBe(0.00);
    });
  });

  describe('getWeeklyCats', () => {
    it('should return weekly category totals for a given transaction type', async () => {
      const mockUserID = 'user123';
      const mockType = 'expense';
      const mockCategories = [
        { name: 'Food', amount: 100 },
        { name: 'Transport', amount: 50 },
      ];

      pool.query.mockResolvedValueOnce({
        rows: mockCategories.map(cat => ({ ...cat, amount: cat.amount.toString() })),
      });

      const result = await getWeeklyCats(mockUserID, mockType);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockUserID, mockType]);
      expect(result).toEqual(mockCategories);
    });

    it('should return an empty array if there are no weekly transactions', async () => {
      const mockUserID = 'user123';
      const mockType = 'expense';

      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await getWeeklyCats(mockUserID, mockType);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockUserID, mockType]);
      expect(result).toEqual([]);
    });
  });

  describe('getMonthlyCats', () => {
    it('should return monthly category totals for a given transaction type', async () => {
      const mockUserID = 'user123';
      const mockType = 'income';
      const mockCategories = [
        { name: 'Salary', amount: 2000 },
        { name: 'Freelance', amount: 500 },
      ];

      pool.query.mockResolvedValueOnce({
        rows: mockCategories.map(cat => ({ ...cat, amount: cat.amount.toString() })),
      });

      const result = await getMonthlyCats(mockUserID, mockType);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockUserID, mockType]);
      expect(result).toEqual(mockCategories);
    });

    it('should return an empty array if there are no monthly transactions', async () => {
      const mockUserID = 'user123';
      const mockType = 'income';

      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await getMonthlyCats(mockUserID, mockType);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockUserID, mockType]);
      expect(result).toEqual([]);
    });
  });

  describe('getYearlyCats', () => {
    it('should return yearly category totals for a given transaction type', async () => {
      const mockUserID = 'user123';
      const mockType = 'savings';
      const mockCategories = [
        { name: 'Emergency Fund', amount: 5000 },
        { name: 'Investments', amount: 3000 },
      ];

      pool.query.mockResolvedValueOnce({
        rows: mockCategories.map(cat => ({ ...cat, amount: cat.amount.toString() })),
      });

      const result = await getYearlyCats(mockUserID, mockType);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockUserID, mockType]);
      expect(result).toEqual(mockCategories);
    });

    it('should return an empty array if there are no yearly transactions', async () => {
      const mockUserID = 'user123';
      const mockType = 'savings';

      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await getYearlyCats(mockUserID, mockType);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockUserID, mockType]);
      expect(result).toEqual([]);
    });
  });

  describe('getWeeklySeries', () => {
    it('should return weekly income, expense, and net totals', async () => {
      const mockUserID = 'user123';
      const mockData = [
        { time_period: 'Mon 01', income: 100, expense: 50, net: 50 },
        { time_period: 'Tue 02', income: 200, expense: 100, net: 100 },
      ];

      pool.query.mockResolvedValueOnce({ rows: mockData });

      const result = await getWeeklySeries(mockUserID);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockUserID]);
      expect(result).toEqual(mockData);
    });

    it('should return an empty array if there is no data', async () => {
      const mockUserID = 'user123';

      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await getWeeklySeries(mockUserID);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockUserID]);
      expect(result).toEqual([]);
    });
  });

  describe('getMonthlySeries', () => {
    it('should return monthly income, expense, and net totals', async () => {
      const mockUserID = 'user123';
      const mockData = [
        { time_period: 'Mon 01', income: 500, expense: 300, net: 200 },
        { time_period: 'Mon 08', income: 700, expense: 400, net: 300 },
      ];

      pool.query.mockResolvedValueOnce({ rows: mockData });

      const result = await getMonthlySeries(mockUserID);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockUserID]);
      expect(result).toEqual(mockData);
    });

    it('should return an empty array if there is no data', async () => {
      const mockUserID = 'user123';

      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await getMonthlySeries(mockUserID);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockUserID]);
      expect(result).toEqual([]);
    });
  });

  describe('getYearlySeries', () => {
    it('should return yearly income, expense, and net totals', async () => {
      const mockUserID = 'user123';
      const mockData = [
        { time_period: 'Jan 2023', income: 1000, expense: 700, net: 300 },
        { time_period: 'Feb 2023', income: 1200, expense: 800, net: 400 },
      ];

      pool.query.mockResolvedValueOnce({ rows: mockData });

      const result = await getYearlySeries(mockUserID);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockUserID]);
      expect(result).toEqual(mockData.reverse());
    });

    it('should return an empty array if there is no data', async () => {
      const mockUserID = 'user123';

      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await getYearlySeries(mockUserID);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockUserID]);
      expect(result).toEqual([]);
    });
  });

  describe('getWeeklyExpenses', () => {
    it('should return weekly expense totals', async () => {
      const mockUserID = 'user123';
      const mockData = [
        { time_period: 'Mon 01', total: 50 },
        { time_period: 'Tue 02', total: 100 },
      ];

      pool.query.mockResolvedValueOnce({ rows: mockData });

      const result = await getWeeklyExpenses(mockUserID);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockUserID]);
      expect(result).toEqual(mockData);
    });

    it('should return an empty array if there is no data', async () => {
      const mockUserID = 'user123';

      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await getWeeklyExpenses(mockUserID);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockUserID]);
      expect(result).toEqual([]);
    });
  });

  describe('getMonthlyExpenses', () => {
    it('should return monthly expense totals', async () => {
      const mockUserID = 'user123';
      const mockData = [
        { time_period: 'Mon 01', total: 300 },
        { time_period: 'Mon 08', total: 400 },
      ];

      pool.query.mockResolvedValueOnce({ rows: mockData });

      const result = await getMonthlyExpenses(mockUserID);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockUserID]);
      expect(result).toEqual(mockData);
    });

    it('should return an empty array if there is no data', async () => {
      const mockUserID = 'user123';

      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await getMonthlyExpenses(mockUserID);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockUserID]);
      expect(result).toEqual([]);
    });
  });

  describe('getYearlyExpenses', () => {
    it('should return yearly expense totals', async () => {
      const mockUserID = 'user123';
      const mockData = [
        { time_period: 'Jan 2023', total: 700 },
        { time_period: 'Feb 2023', total: 800 },
      ];

      pool.query.mockResolvedValueOnce({ rows: mockData });

      const result = await getYearlyExpenses(mockUserID);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockUserID]);
      expect(result).toEqual(mockData.reverse());
    });

    it('should return an empty array if there is no data', async () => {
      const mockUserID = 'user123';

      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await getYearlyExpenses(mockUserID);

      expect(pool.query).toHaveBeenCalledWith(expect.any(String), [mockUserID]);
      expect(result).toEqual([]);
    });
  });
});
