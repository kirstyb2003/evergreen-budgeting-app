const allowCors = require('../allow-cors');

// Unit Tests
describe('allowCors Middleware', () => {
  it('should set the correct CORS headers', async () => {
    const mockFn = jest.fn();
    const req = { method: 'GET' };
    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      end: jest.fn(),
    };

    await allowCors(mockFn)(req, res);

    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Credentials', true);
    expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
    expect(res.setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Methods',
      'GET,OPTIONS,PATCH,DELETE,POST,PUT'
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
  });

  it('should return 200 for OPTIONS requests', async () => {
    const mockFn = jest.fn();
    const req = { method: 'OPTIONS' };
    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      end: jest.fn(),
    };

    await allowCors(mockFn)(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.end).toHaveBeenCalled();
    expect(mockFn).not.toHaveBeenCalled();
  });

  it('should call the wrapped function for non-OPTIONS requests', async () => {
    const mockFn = jest.fn();
    const req = { method: 'GET' };
    const res = {
      setHeader: jest.fn(),
      status: jest.fn(),
      end: jest.fn(),
    };

    await allowCors(mockFn)(req, res);

    expect(mockFn).toHaveBeenCalledWith(req, res);
  });
});
