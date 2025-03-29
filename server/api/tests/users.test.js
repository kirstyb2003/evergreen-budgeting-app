const { createUser, findUserByUsername, findUserByEmail, authenticateLogin } = require('../database-queries/users');
const pool = require('../pool');

jest.mock('../pool');

describe('Users Queries', () => {
  describe('createUser', () => {
    it('should create a new user and return the user ID', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ user_id: 1 }] });

      const result = await createUser('testuser', 'test@example.com', 'password123', 'USD', 1000);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        ['testuser', 'test@example.com', 'password123', 'USD', 1000]
      );
      expect(result).toEqual({ user_id: 1 });
    });

    it('should throw an error if the query fails', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      await expect(
        createUser('testuser', 'test@example.com', 'password123', 'USD', 1000)
      ).rejects.toThrow('Database error');
    });
  });

  describe('findUserByUsername', () => {
    it('should return users matching the username', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ user_id: 1, username: 'testuser' }] });

      const result = await findUserByUsername('testuser');

      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM users WHERE username = $1;'), [
        'testuser',
      ]);
      expect(result).toEqual([{ user_id: 1, username: 'testuser' }]);
    });

    it('should return an empty array if no users are found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await findUserByUsername('nonexistentuser');

      expect(result).toEqual([]);
    });
  });

  describe('findUserByEmail', () => {
    it('should return users matching the email', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ user_id: 1, email: 'test@example.com' }] });

      const result = await findUserByEmail('test@example.com');

      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM users WHERE email = $1;'), [
        'test@example.com',
      ]);
      expect(result).toEqual([{ user_id: 1, email: 'test@example.com' }]);
    });

    it('should return an empty array if no users are found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await findUserByEmail('nonexistent@example.com');

      expect(result).toEqual([]);
    });
  });

  describe('authenticateLogin', () => {
    it('should authenticate a user and return user details without the password', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ user_id: 1, username: 'testuser', email: 'test@example.com', password: 'hashedpassword' }],
      });

      const result = await authenticateLogin('testuser', 'password123');

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM users WHERE (username = $1 OR email = $1) AND password = crypt($2, password)'),
        ['testuser', 'password123']
      );
      expect(result).toEqual({ user_id: 1, username: 'testuser', email: 'test@example.com' });
    });

    it('should return null if authentication fails', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await authenticateLogin('testuser', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('should throw an error if the query fails', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      await expect(authenticateLogin('testuser', 'password123')).rejects.toThrow('Database error');
    });
  });
});
