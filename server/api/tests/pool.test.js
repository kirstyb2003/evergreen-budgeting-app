const { Pool } = require('pg');
jest.mock('pg', () => {
  const mClient = {
    query: jest.fn(),
    release: jest.fn(),
  };
  const mPool = {
    connect: jest.fn(() => mClient),
    query: jest.fn(),
    end: jest.fn(),
  };
  return {
    Pool: jest.fn((config) => {
      mPool.config = config;
      return mPool;
    }),
  };
});

jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

beforeEach(() => {
  process.env.DB_USER = 'test_user';
  process.env.DB_PASSWORD = 'test_password';
  process.env.DB_HOST = 'localhost';
  process.env.DB_PORT = '5432';
  process.env.DB_DATABASE = 'test_database';
  process.env.JWT_SECRET = 'test_secret';
});

const pool = require('../pool');

// Unit Tests
describe('Database Pool', () => {
  it('should create a new pool instance', () => {
    expect(Pool).toHaveBeenCalledTimes(1);
  });

  it('should execute a query', async () => {
    const mockQuery = 'SELECT * FROM users';
    const mockResult = { rows: [{ id: 1, name: 'John Doe' }] };
    Pool().query.mockResolvedValueOnce(mockResult);

    const result = await pool.query(mockQuery);
    expect(Pool().query).toHaveBeenCalledWith(mockQuery);
    expect(result).toEqual(mockResult);
  });

  it('should handle connection errors', async () => {
    const mockError = new Error('Connection failed');
    Pool().query.mockRejectedValueOnce(mockError);

    await expect(pool.query('SELECT * FROM users')).rejects.toThrow('Connection failed');
  });
});
