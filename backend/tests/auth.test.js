const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Authentication Tests', () => {
  describe('Password Hashing', () => {
    test('should hash password correctly', async () => {
      const password = 'testPassword123';
      const hashedPassword = await bcrypt.hash(password, 12);
      
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(0);
    });

    test('should compare password correctly', async () => {
      const password = 'testPassword123';
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const isMatch = await bcrypt.compare(password, hashedPassword);
      expect(isMatch).toBe(true);
      
      const isNotMatch = await bcrypt.compare('wrongPassword', hashedPassword);
      expect(isNotMatch).toBe(false);
    });
  });

  describe('JWT Token', () => {
    test('should generate valid JWT token', () => {
      const payload = { id: '123', role: 'farmer' };
      const token = jwt.sign(payload, 'test_secret', { expiresIn: '7d' });
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    test('should verify JWT token correctly', () => {
      const payload = { id: '123', role: 'farmer' };
      const token = jwt.sign(payload, 'test_secret', { expiresIn: '7d' });
      
      const decoded = jwt.verify(token, 'test_secret');
      expect(decoded.id).toBe(payload.id);
      expect(decoded.role).toBe(payload.role);
    });
  });

  describe('Compensation Calculation', () => {
    test('should calculate compensation correctly', () => {
      const baseRate = 15000;
      const acres = 5;
      const severityMultiplier = 0.7;
      
      const compensation = Math.round(baseRate * acres * severityMultiplier);
      expect(compensation).toBe(52500);
    });
  });
});
