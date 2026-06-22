const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const Claim = require('../models/Claim');
const Wallet = require('../models/Wallet');
const AuditLog = require('../models/AuditLog');
const Fund = require('../models/Fund');
const SchemeApplication = require('../models/SchemeApplication');
const { createNotification } = require('../services/notificationService');
const { analyzeCropDamage } = require('../services/aiService');

const BASE_AMOUNTS = {
  wheat: 30000, rice: 35000, cotton: 25000, sugarcane: 40000, maize: 20000,
  bajra: 15000, jowar: 15000, soybean: 22000, groundnut: 28000, potato: 45000,
  onion: 35000, tomato: 40000
};

// --- Helper to get global fund ---
async function getSystemFund() {
  let fund = await Fund.findOne();
  if (!fund) {
    fund = await Fund.create({ balance: 1000000, transactions: [] }); // Start with 1M if none
  }
  return fund;
}

// @desc    Get Fund Balance & History
// @route   GET /api/officer/funds
router.get('/funds', protect, authorize('officer'), asyncHandler(async (req, res) => {
  const fund = await getSystemFund();
  const history = fund.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json({
    success: true,
    data: {
      balance: fund.balance,
      history: history
    }
  });
}));

// @desc    Add Funds (Deposit into Treasury)
// @route   POST /api/officer/funds/add
router.post('/funds/add', [
  body('amount').toFloat().isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('source').optional().trim()
], protect, authorize('officer'), asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { amount, source } = req.body;

  const fund = await getSystemFund();
  fund.balance += Number(amount);
  fund.transactions.push({
    type: 'CREDIT',
    amount: Number(amount),
    source: source || 'Government Allocation',
    officerId: req.user._id,
    date: new Date()
  });

  await fund.save();

  await AuditLog.create({
    userId: req.user._id,
    userType: 'officer',
    action: 'fund_added',
    resource: 'treasury',
    metadata: { amount, source }
  });

  res.json({ success: true, balance: fund.balance });
}));

// @desc    Get Officer Analytics
// @route   GET /api/officer/analytics
router.get('/analytics', protect, authorize('officer'), asyncHandler(async (req, res) => {
  const [approvedStats, statusDistribution, cropDistribution, monthlyData, recentFundTransactions, schemeStatus] = await Promise.all([
    Claim.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, totalReleased: { $sum: '$funds.amount' }, count: { $sum: 1 } } }
    ]),
    Claim.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Claim.aggregate([
      { $group: { _id: '$crop', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Claim.aggregate([
      { $match: { status: 'approved', 'funds.releasedAt': { $exists: true, $ne: null } } },
      {
        $group: {
          _id: { $month: '$funds.releasedAt' },
          amount: { $sum: '$funds.amount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]),
    getSystemFund().then(f => f.transactions.sort((a, b) => b.date - a.date).slice(0, 5)),
    SchemeApplication.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
  ]);

  const fund = await getSystemFund();

  // Transform monthly data - Ensure all months are present
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyReleased = monthNames.reduce((acc, month, index) => {
    acc[month] = 0;
    return acc;
  }, {});

  monthlyData.forEach(curr => {
    const monthName = monthNames[curr._id - 1];
    if (monthName) monthlyReleased[monthName] = curr.amount;
  });

  // Transform status data
  const statusCounts = statusDistribution.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  const schemeCounts = schemeStatus.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      totalReleased: approvedStats[0]?.totalReleased || 0,
      totalClaims: statusDistribution.reduce((sum, s) => sum + s.count, 0),
      statusCounts,
      schemeCounts,
      claimsPerCrop: cropDistribution,
      monthlyReleased,
      sourceUsage: recentFundTransactions.map(t => ({ name: t.source, value: t.amount })),
      topCrops: cropDistribution.slice(0, 5),
      treasuryBalance: fund.balance
    }
  });
}));

// --- Scheme Applications ---

// @desc    Get all scheme applications
// @route   GET /api/officer/schemes
router.get('/schemes', protect, authorize('officer'), asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status && status !== 'All') filter.status = status;

  const applications = await SchemeApplication.find(filter)
    .populate('farmerId', 'name email phone avatar')
    .sort({ createdAt: -1 });

  res.json({ success: true, applications });
}));

// @desc    Verify/Approve Scheme Application
// @route   POST /api/officer/schemes/:id/verify
router.post('/schemes/:id/verify', protect, authorize('officer'), asyncHandler(async (req, res) => {
  const { decision, comments, amount } = req.body;
  const application = await SchemeApplication.findById(req.params.id);

  if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

  application.status = decision;
  application.reviewComments = comments;
  application.officerId = req.user._id;
  application.processedAt = new Date();

  if (decision === 'Approved') {
    application.sanctionedAmount = Number(amount);

    // 1. Check Treasury Balance
    const fund = await getSystemFund();
    if (fund.balance < Number(amount)) {
      return res.status(400).json({ success: false, message: 'Insufficient treasury balance' });
    }

    // 2. Debit Treasury
    fund.balance -= Number(amount);
    fund.transactions.push({
      type: 'DEBIT',
      amount: Number(amount),
      source: `Scheme Grant: ${application.schemeName}`,
      officerId: req.user._id,
      date: new Date()
    });
    await fund.save();

    // 3. Credit Farmer Wallet
    let wallet = await Wallet.findOne({ farmerId: application.farmerId });
    if (!wallet) wallet = await Wallet.create({ farmerId: application.farmerId });

    wallet.balance += Number(amount);
    wallet.transactions.push({
      type: 'credit',
      amount: Number(amount),
      description: `Scheme Sanction: ${application.schemeName}`,
      status: 'completed',
      balanceAfter: wallet.balance
    });
    await wallet.save();

    await createNotification(
      application.farmerId,
      'farmer',
      'scheme_approved',
      `Scheme ${application.schemeName} Approved! ₹${amount} allocated to your wallet.`,
      { applicationId: application._id }
    );
  } else {
    await createNotification(
      application.farmerId,
      'farmer',
      'scheme_rejected',
      `Scheme ${application.schemeName} Rejected. Reason: ${comments}`,
      { applicationId: application._id }
    );
  }

  await application.save();
  res.json({ success: true, application });
}));

// @desc    Get All Claims with Filtering
// @route   GET /api/officer/claims
router.get('/claims', protect, authorize('officer'), asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (status && status !== 'all') {
    // "Wait to Check" shows both new (submitted) and pending_review (analyzed, awaiting decision)
    if (status === 'pending_review') {
      filter.status = { $in: ['submitted', 'pending_review', 'ai_analyzing'] };
    } else {
      filter.status = status;
    }
  }

  const claims = await Claim.find(filter)
    .populate('farmerId', 'name email phone')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const count = await Claim.countDocuments(filter);

  res.json({
    success: true,
    claims,
    totalClaims: count,
    pagination: {
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    }
  });
}));

// @desc    Get Pending Claims (submitted + ai_analyzing + pending_review = need officer action)
// @route   GET /api/officer/claims/pending
router.get('/claims/pending', protect, authorize('officer'), asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;
  const claims = await Claim.find({ status: { $in: ['submitted', 'pending_review', 'ai_analyzing'] } })
    .populate('farmerId', 'name email phone')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  res.json({ success: true, claims });
}));

// @desc    Get Single Claim Detail (no auto AI; officer clicks "Submit to AI Analysis" to run)
// @route   GET /api/officer/claims/:id
router.get('/claims/:id', protect, authorize('officer'), asyncHandler(async (req, res) => {
  const claim = await Claim.findById(req.params.id)
    .populate('farmerId', 'name email phone address aadhaar bankDetails profileComplete');

  if (!claim) return res.status(404).json({ success: false, message: 'Claim record not found' });

  res.json({ success: true, claim });
}));

// @desc    Run AI analysis on claim (officer-triggered); returns updated claim with aiAnalysis
// @route   POST /api/officer/claims/:id/analyze
router.post('/claims/:id/analyze', protect, authorize('officer'), asyncHandler(async (req, res) => {
  let claim = await Claim.findById(req.params.id)
    .populate('farmerId', 'name email phone address aadhaar bankDetails profileComplete');

  if (!claim) return res.status(404).json({ success: false, message: 'Claim record not found' });
  if (!claim.images || claim.images.length === 0) {
    return res.status(400).json({ success: false, message: 'No images to analyze' });
  }

  claim.status = 'ai_analyzing';
  await claim.save();

  const baseUrl = process.env.BACKEND_URL || process.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const imageUrls = claim.images.map(img => (img.url && img.url.startsWith('http')) ? img.url : `${baseUrl}${img.url || img}`);
  const compensationRate = BASE_AMOUNTS[(claim.crop || '').toLowerCase()] || 25000;

  const report = await analyzeCropDamage(
    { crop: claim.crop, acres: claim.acres },
    imageUrls,
    compensationRate
  );

  claim.aiAnalysis = { ...report, analyzedAt: new Date() };
  claim.status = 'pending_review';
  await claim.save();

  res.json({ success: true, claim });
}));

// @desc    Verify/Process a Claim
// @route   POST /api/officer/claims/:id/verify
router.post('/claims/:id/verify', protect, authorize('officer'), asyncHandler(async (req, res) => {
  const { decision, comments, requestedInfo, compensationAmount } = req.body;

  if (!['approved', 'rejected', 'info_requested'].includes(decision)) {
    return res.status(400).json({ success: false, message: 'Terminal decision state required' });
  }

  const claim = await Claim.findById(req.params.id);
  if (!claim) return res.status(404).json({ success: false, message: 'Claim not found' });

  if (decision === 'approved') {
    const amount = Number(compensationAmount) || claim.aiAnalysis?.suggestedCompensation || claim.aiAnalysis?.compensationAmount || 0;
    const fund = await getSystemFund();

    if (fund.balance < amount) {
      return res.status(400).json({
        success: false,
        message: `Treasury Liquidity Exhausted! Balance: ₹${fund.balance}. Required: ₹${amount}`
      });
    }

    // 1. Deduct from System Treasury
    fund.balance -= amount;
    fund.transactions.push({
      type: 'DEBIT',
      amount: amount,
      source: `Settlement: Claim #${claim._id.toString().slice(-6).toUpperCase()}`,
      referenceId: claim._id,
      officerId: req.user._id,
      date: new Date()
    });
    await fund.save();

    // 2. Update Claim Status
    claim.status = 'approved';
    claim.funds = {
      amount,
      releasedAt: new Date(),
      transactionId: `TXN-SET-${Date.now()}`
    };

    // 3. Credit Farmer Wallet
    let wallet = await Wallet.findOne({ farmerId: claim.farmerId });
    if (!wallet) wallet = await Wallet.create({ farmerId: claim.farmerId });

    wallet.balance += amount;
    wallet.transactions.push({
      type: 'credit',
      amount,
      description: `Indemnity Settlement: Claim #${claim._id.toString().slice(-6).toUpperCase()}`,
      claimId: claim._id,
      balanceAfter: wallet.balance
    });
    await wallet.save();

    await createNotification(
      claim.farmerId,
      'farmer',
      'claim_approved',
      `Indemnity Authorized: ₹${amount.toLocaleString()} has been credited to your wallet.`,
      { claimId: claim._id, amount }
    );
  }
  else if (decision === 'rejected') {
    if (!comments) return res.status(400).json({ success: false, message: 'Rejection justification required' });
    claim.status = 'rejected';
    await createNotification(
      claim.farmerId,
      'farmer',
      'claim_rejected',
      `Claim Status: Rejected. Reason: ${comments}`,
      { claimId: claim._id }
    );
  }

  claim.verification = {
    ...claim.verification,
    decision,
    comments,
    verifiedAt: new Date()
  };

  await claim.save();

  res.json({ success: true, claim });
}));

// @desc    Get Dashboard Summary
// @route   GET /api/officer/dashboard
router.get('/dashboard', protect, authorize('officer'), asyncHandler(async (req, res) => {
  const [counts, fund, schemeCounts] = await Promise.all([
    Claim.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    getSystemFund(),
    SchemeApplication.countDocuments({ status: 'Pending' })
  ]);

  const stats = counts.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  const pendingClaims = (stats['submitted'] || 0) + (stats['pending_review'] || 0) + (stats['ai_analyzing'] || 0);

  res.json({
    success: true,
    data: {
      pendingClaims,
      approvedClaims: stats['approved'] || 0,
      rejectedClaims: stats['rejected'] || 0,
      pendingSchemes: schemeCounts,
      fundBalance: fund.balance
    }
  });
}));

// @desc    Get Audit Logs
// @route   GET /api/officer/audit-logs
router.get('/audit-logs', protect, authorize('officer'), asyncHandler(async (req, res) => {
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, logs });
}));

module.exports = router;

