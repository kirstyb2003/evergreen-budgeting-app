const jwt = require('jsonwebtoken');
const authenticateToken = require('../authMiddleware');

jest.mock('jsonwebtoken');

// Unit Tests
describe('authenticateToken Middleware', () => {
  it('should return 401 if no token is provided', () => {
    const req = { headers: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Access token required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if the token is invalid', () => {
    const req = { headers: { authorization: 'Bearer invalidToken' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(new Error('Invalid token'), null);
    });

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if the token is valid', () => {
    const req = { headers: { authorization: 'Bearer validToken' } };
    const res = {};
    const next = jest.fn();

    const mockUser = { id: 1, name: 'John Doe' };
    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(null, mockUser);
    });

    authenticateToken(req, res, next);

    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
  });
});
