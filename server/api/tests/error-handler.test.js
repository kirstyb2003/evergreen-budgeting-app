const errorHandler = require('../error-handler');

// Unit Tests
describe('Error Handler Middleware', () => {
  it('should log the error and return a 500 status with the passed in message', () => {
    const err = new Error('Test error');
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    console.error = jest.fn();

    errorHandler(err, req, res, next);

    expect(console.error).toHaveBeenCalledWith(err.stack);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Test error' });
  });

  it('should log the error and return a 500 status with the deafault message', () => {
    const err = new Error('');
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    console.error = jest.fn();

    errorHandler(err, req, res, next);

    expect(console.error).toHaveBeenCalledWith(err.stack);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });

  it('should return the error status and message if provided', () => {
    const err = { status: 400, message: 'Bad Request' };
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Bad Request' });
  });
});
