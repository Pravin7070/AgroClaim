const errorHandler = require('../middleware/errorHandler');

describe('Error Handler', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  test('returns 500 and generic message in production for unknown errors', () => {
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const err = new Error('Internal DB leak');
    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Server Error'
    });

    process.env.NODE_ENV = origEnv;
  });

  test('returns actual message in development for 500 errors', () => {
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const err = new Error('Internal DB leak');
    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Internal DB leak'
    });

    process.env.NODE_ENV = origEnv;
  });

  test('preserves statusCode and message for 400 validation errors', () => {
    const err = new Error('Validation failed');
    err.statusCode = 400;
    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Validation failed'
    });
  });
});
