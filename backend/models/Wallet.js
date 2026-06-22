const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true, unique: true },
  balance: { type: Number, default: 0, min: 0 },
  transactions: [{
    type: { type: String, enum: ['credit', 'debit'], required: true },
    amount: { type: Number, required: true },
    description: String,
    claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim' },
    balanceAfter: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String,
    bankName: String
  },
  upiId: String
}, { timestamps: true });

walletSchema.index({ farmerId: 1 });

module.exports = mongoose.model('Wallet', walletSchema);
