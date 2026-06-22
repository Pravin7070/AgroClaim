const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const Claim = require('../models/Claim');
const Wallet = require('../models/Wallet');
const Farmer = require('../models/Farmer');
const Officer = require('../models/Officer');
const SchemeApplication = require('../models/SchemeApplication');
const { createNotification } = require('../services/notificationService');
const { getSchemeDocuments } = require('../utils/schemeDocuments');
const logger = require('../utils/logger');
const AuditLog = require('../models/AuditLog');
const upload = require('../middleware/upload');

const claimValidation = [
  body('crop').notEmpty().trim().withMessage('Crop name is required'),
  body('acres').toFloat().isFloat({ min: 0.01, max: 50000 }).withMessage('Acres must be between 0.01 and 50000')
];

const withdrawValidation = [
  body('amount').toFloat().isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('bankDetails').optional()
];

const { performIntegrityCheck } = require('../services/integrityService');

// @desc    Submit a new claim (multimedia + integrity check)
// @route   POST /api/farmer/claims
// @access  Private/Farmer
router.post('/claims', protect, authorize('farmer'), upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 1 }
]), asyncHandler(async (req, res) => {
  const { crop, acres, damageInfo, location, keyframes } = req.body;

  let parsedDamageInfo, parsedLocation, parsedKeyframes;
  try {
    parsedDamageInfo = typeof damageInfo === 'string' ? JSON.parse(damageInfo) : (damageInfo || {});
    parsedLocation = typeof location === 'string' ? JSON.parse(location) : (location || {});
    parsedKeyframes = typeof keyframes === 'string' ? JSON.parse(keyframes) : (keyframes || []);
  } catch (e) {
    return res.status(400).json({ success: false, message: 'Invalid JSON data formats' });
  }

  if (!req.files || !req.files.images || req.files.images.length < 1) {
    return res.status(400).json({ success: false, message: 'Evidence package requires at least 1 photo' });
  }

  const images = req.files.images.map(file => ({
    url: `/uploads/${file.filename}`,
    uploadedAt: new Date()
  }));

  const videos = req.files.video ? [{
    url: `/uploads/${req.files.video[0].filename}`,
    keyframes: parsedKeyframes,
    uploadedAt: new Date()
  }] : [];

  const claim = await Claim.create({
    farmerId: req.user._id,
    crop,
    acres,
    damageInfo: parsedDamageInfo,
    location: parsedLocation,
    images,
    videos,
    status: 'submitted'
  });

  // Trigger Background Integrity Analysis
  performIntegrityCheck(claim._id).catch(err => logger.error(`Integrity task failed: ${err.message}`));

  const officer = await Officer.findOne();
  if (officer) {
    claim.officerId = officer._id;
    await claim.save();

    await createNotification(
      officer._id,
      'officer',
      'claim_submitted',
      `🚨 Digital Evidence Package: #${claim._id.toString().slice(-6).toUpperCase()} submitted. AI Integrity checking...`,
      { claimId: claim._id }
    );
  }

  await createNotification(
    req.user._id,
    'farmer',
    'claim_submitted',
    'Your evidence package has been uploaded and synced. AI is performing integrity checks.',
    { claimId: claim._id }
  );

  res.status(201).json({ success: true, claim });
}));

// @desc    Get required documents for a scheme
// @route   GET /api/farmer/schemes/:schemeName/documents
router.get('/schemes/:schemeName/documents', protect, authorize('farmer'), asyncHandler(async (req, res) => {
  const { schemeName } = req.params;
  const documents = getSchemeDocuments(schemeName);
  res.json({ success: true, scheme: schemeName, requiredDocuments: documents });
}));

// @desc    Apply for a Scheme
// @route   POST /api/farmer/schemes/apply
router.post('/schemes/apply', protect, authorize('farmer'), upload.array('documents', 5), asyncHandler(async (req, res) => {
  const { schemeName, schemeType, category, applicationData } = req.body;

  if (!schemeName || !schemeType || !category) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: schemeName, schemeType, or category'
    });
  }

  const parsedData = typeof applicationData === 'string' ? JSON.parse(applicationData) : applicationData;

  const documents = req.files ? req.files.map(file => ({
    name: file.originalname,
    url: `/uploads/${file.filename}`,
    uploadedAt: new Date()
  })) : [];

  const requiredDocuments = getSchemeDocuments(schemeName);

  const application = await SchemeApplication.create({
    farmerId: req.user._id,
    schemeName,
    schemeType,
    category,
    applicationData: parsedData,
    documents,
    requiredDocuments,
    status: 'Pending'
  });

  // Notify officers
  const officer = await Officer.findOne();
  if (officer) {
    await createNotification(
      officer._id,
      'officer',
      'scheme_applied',
      `New scheme application for ${schemeName} by ${req.user.name || 'Farmer'}`,
      { applicationId: application._id }
    );
  }

  res.status(201).json({ success: true, application });
}));

// @desc    Get All Scheme Applications for Farmer
// @route   GET /api/farmer/schemes/applications
router.get('/schemes/applications', protect, authorize('farmer'), asyncHandler(async (req, res) => {
  const applications = await SchemeApplication.find({ farmerId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, applications });
}));

// @desc    Get all claims for a farmer
// @route   GET /api/farmer/claims
// @access  Private/Farmer
router.get('/claims', protect, authorize('farmer'), asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = { farmerId: req.user._id };

  if (status && status !== 'all') query.status = status;

  const claims = await Claim.find(query)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const total = await Claim.countDocuments(query);

  res.json({
    success: true,
    claims,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    }
  });
}));

// @desc    Delete a claim
// @route   DELETE /api/farmer/claims/:id
// @access  Private/Farmer
router.delete('/claims/:id', protect, authorize('farmer'), asyncHandler(async (req, res) => {
  const claim = await Claim.findOne({ _id: req.params.id, farmerId: req.user._id });

  if (!claim) {
    return res.status(404).json({ success: false, message: 'Claim not found' });
  }

  if (!['submitted', 'ai_analyzing', 'pending_review'].includes(claim.status)) {
    return res.status(400).json({ success: false, message: 'Cannot delete processed claims' });
  }

  await claim.deleteOne();

  res.json({ success: true, message: 'Claim retracted successfully' });
}));

// @desc    Get wallet details
// @route   GET /api/farmer/wallet
// @access  Private/Farmer
router.get('/wallet', protect, authorize('farmer'), asyncHandler(async (req, res) => {
  let wallet = await Wallet.findOne({ farmerId: req.user._id });
  if (!wallet) {
    wallet = await Wallet.create({
      farmerId: req.user._id,
      balance: 0,
      transactions: []
    });
  }

  res.json({ success: true, wallet });
}));

// @desc    Update farmer profile
// @route   PUT /api/farmer/profile
// @access  Private/Farmer
router.put('/profile', protect, authorize('farmer'), asyncHandler(async (req, res) => {
  const { name, phone, address, aadhaar, bankDetails } = req.body;
  const farmer = await Farmer.findById(req.user._id);

  if (!farmer) return res.status(404).json({ success: false, message: 'Farmer record not found' });

  if (name) farmer.name = name;
  if (phone) farmer.phone = phone;
  if (address) farmer.address = address;
  if (aadhaar) farmer.aadhaar = aadhaar;
  if (bankDetails) farmer.bankDetails = bankDetails;

  // Intelligent profile completion check
  const requiredFields = [farmer.name, farmer.phone, farmer.aadhaar];
  const addressFields = farmer.address ? [farmer.address.village, farmer.address.district, farmer.address.state] : [];
  const bankFields = farmer.bankDetails ? [farmer.bankDetails.accountNumber, farmer.bankDetails.ifscCode] : [];

  const allSet = [...requiredFields, ...addressFields, ...bankFields].every(f => !!f);
  farmer.profileComplete = allSet;

  await farmer.save();

  res.json({ success: true, user: farmer });
}));

// @desc    Get dashboard stats
// @route   GET /api/farmer/dashboard
// @access  Private/Farmer
router.get('/dashboard', protect, authorize('farmer'), asyncHandler(async (req, res) => {
  const activeClaims = await Claim.countDocuments({
    farmerId: req.user._id,
    status: { $in: ['submitted', 'ai_analyzing', 'pending_review'] }
  });

  const wallet = await Wallet.findOne({ farmerId: req.user._id });
  const recentClaims = await Claim.find({ farmerId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(5);

  const activeSchemes = await SchemeApplication.countDocuments({
    farmerId: req.user._id,
    status: 'Pending'
  });

  res.json({
    success: true,
    data: {
      activeClaims,
      activeSchemes,
      walletBalance: wallet?.balance || 0,
      recentClaims,
      profileComplete: req.user.profileComplete
    }
  });
}));

// @desc    Withdraw funds from wallet
// @route   POST /api/farmer/wallet/withdraw
// @access  Private/Farmer
router.post('/wallet/withdraw', protect, authorize('farmer'), withdrawValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { amount, bankDetails } = req.body;

  const wallet = await Wallet.findOne({ farmerId: req.user._id });
  if (!wallet || wallet.balance < amount) {
    return res.status(400).json({ success: false, message: 'Insufficient liquidity in wallet' });
  }

  // 1. Deduct balance
  wallet.balance -= Number(amount);
  wallet.transactions.push({
    type: 'debit',
    amount: Number(amount),
    description: `Liquidity Withdrawal to Bank (A/C: ****${bankDetails?.accountNumber?.slice(-4) || 'XXXX'})`,
    status: 'completed',
    balanceAfter: wallet.balance
  });

  await wallet.save();

  await AuditLog.create({
    userId: req.user._id,
    userType: 'farmer',
    action: 'wallet_withdrawal',
    resource: 'wallet',
    metadata: { amount, bankDetails: { bankName: bankDetails?.bankName } }
  });

  res.json({ success: true, wallet, message: 'Liquidity successfully transferred to bank' });
}));

module.exports = router;

