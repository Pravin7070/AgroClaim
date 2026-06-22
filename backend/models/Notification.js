const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userType: { type: String, enum: ['farmer', 'officer'], required: true },
  type: { 
    type: String, 
    enum: ['claim_submitted', 'ai_analysis_complete', 'claim_approved', 'claim_rejected', 
           'info_requested', 'funds_released', 'wallet_updated', 'kyc_verified'], 
    required: true 
  },
  message: { type: String, required: true },
  metadata: {
    claimId: mongoose.Schema.Types.ObjectId,
    amount: Number,
    additionalInfo: mongoose.Schema.Types.Mixed
  },
  read: { type: Boolean, default: false },
  readAt: Date
}, { timestamps: true });

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
