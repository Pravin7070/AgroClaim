const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Farmer = require('../models/Farmer');
const Officer = require('../models/Officer');
const Wallet = require('../models/Wallet');
const { protect } = require('../middleware/auth');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

router.post('/register/farmer', [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('phone').notEmpty(),
  body('password').isLength({ min: 6 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, phone, password, address } = req.body;

    const existingFarmer = await Farmer.findOne({ email });
    if (existingFarmer) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const farmer = await Farmer.create({ name, email, phone, password, address });

    await Wallet.create({ farmerId: farmer._id });

    const token = generateToken(farmer._id, 'farmer');

    res.status(201).json({
      success: true,
      token,
      user: {
        id: farmer._id,
        name: farmer.name,
        email: farmer.email,
        role: 'farmer'
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/register/officer', [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('phone').notEmpty(),
  body('password').isLength({ min: 6 }),
  body('employeeId').notEmpty(),
  body('district').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, phone, password, employeeId, district } = req.body;

    const existingOfficer = await Officer.findOne({ email });
    if (existingOfficer) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const existingOfficerId = await Officer.findOne({ employeeId });
    if (existingOfficerId) {
      return res.status(400).json({ success: false, message: 'Employee ID already registered' });
    }

    const officer = await Officer.create({ name, email, phone, password, employeeId, district });

    const token = generateToken(officer._id, 'officer');

    res.status(201).json({
      success: true,
      token,
      user: {
        id: officer._id,
        name: officer.name,
        email: officer.email,
        role: 'officer'
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login/farmer', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const farmer = await Farmer.findOne({ email }).select('+password');
    if (!farmer || !(await farmer.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(farmer._id, 'farmer');

    res.json({
      success: true,
      token,
      user: {
        id: farmer._id,
        name: farmer.name,
        email: farmer.email,
        role: 'farmer'
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login/officer', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const officer = await Officer.findOne({ email }).select('+password');
    if (!officer || !(await officer.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(officer._id, 'officer');

    res.json({
      success: true,
      token,
      user: {
        id: officer._id,
        name: officer.name,
        email: officer.email,
        role: 'officer'
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;
