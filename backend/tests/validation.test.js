const express = require('express');
const request = require('supertest');
const { body, validationResult } = require('express-validator');

const claimValidation = [
  body('crop').notEmpty().trim().withMessage('Crop name is required'),
  body('acres').toFloat().isFloat({ min: 0.01, max: 50000 }).withMessage('Acres must be between 0.01 and 50000')
];

const withdrawValidation = [
  body('amount').toFloat().isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('bankDetails').optional()
];

const app = express();
app.use(express.json());

app.post('/test/claim', claimValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  res.status(200).json({ success: true });
});

app.post('/test/withdraw', withdrawValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  res.status(200).json({ success: true });
});

describe('Claim validation', () => {
  test('rejects empty crop', async () => {
    const res = await request(app)
      .post('/test/claim')
      .send({ crop: '', acres: 5 });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.some(e => e.path === 'crop')).toBe(true);
  });

  test('rejects invalid acres (zero)', async () => {
    const res = await request(app)
      .post('/test/claim')
      .send({ crop: 'Rice', acres: 0 });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('rejects negative acres', async () => {
    const res = await request(app)
      .post('/test/claim')
      .send({ crop: 'Rice', acres: -1 });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('accepts valid claim body', async () => {
    const res = await request(app)
      .post('/test/claim')
      .send({ crop: 'Wheat', acres: 2.5 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Withdraw validation', () => {
  test('rejects zero amount', async () => {
    const res = await request(app)
      .post('/test/withdraw')
      .send({ amount: 0 });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('rejects negative amount', async () => {
    const res = await request(app)
      .post('/test/withdraw')
      .send({ amount: -100 });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test('accepts valid withdraw body', async () => {
    const res = await request(app)
      .post('/test/withdraw')
      .send({ amount: 500 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
