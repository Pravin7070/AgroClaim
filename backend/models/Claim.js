const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  crop: { type: String, required: true },
  acres: { type: Number, required: true },
  damageInfo: {
    type: { type: String, required: true },
    severity: { type: String, default: 'moderate' },
    description: String,
    dateOccurred: Date
  },
  location: {
    village: String,
    district: String,
    coordinates: { lat: Number, lng: Number }
  },
  images: [{
    url: String,
    hash: String, // SHA256/Perceptual hash for duplicate detection
    uploadedAt: Date
  }],
  videos: [{
    url: String,
    keyframes: [String], // Array of extracted image URLs from video
    uploadedAt: Date
  }],
  integrityReport: {
    status: { type: String, enum: ['clean', 'warning', 'flagged'], default: 'clean' },
    issues: [{
      type: { type: String }, // duplicate, stock, manipulated, malware
      message: String,
      severity: { type: String, enum: ['low', 'medium', 'high'] },
      imageUrl: String
    }],
    checkedAt: Date
  },
  aiAnalysis: {
    // Structured report (from officer-triggered pipeline)
    damageType: String,
    severityPercent: Number,
    cause: String,
    affectedAreaPercent: Number,
    confidence: Number,
    suggestedCompensation: Number,
    // Legacy / extended
    cropDetected: String,
    damageAssessment: String,
    compensationAmount: Number,
    riskScore: Number,
    fraudScore: Number,
    reasoning: String,
    recommendations: [String],
    analyzedAt: Date,
    deepAnalysis: {
      cropIdentification: {
        exact_crop_type: String,
        confidence_level: Number,
        visual_markers: [String]
      },
      damageCategory: String,
      visualEvidence: {
        leaf_condition: [String],
        stem_status: [String],
        color_stress_markers: [String],
        pest_traces: [String],
        fungal_indicators: [String],
        soil_moisture_state: String,
        waterlogging_evidence: [String]
      },
      technicalObservations: {
        plant_density: String,
        growth_stage: String,
        weather_impact_signs: [String],
        secondary_stress: String
      },
      severityDetails: {
        damage_percentage: Number,
        severity_rating: Number,
        economic_loss_category: String,
        recovery_potential: String
      },
      verificationNotes: String
    }
  },
  scheme: {
    name: String,
    requiredDocuments: [String]
  },
  status: {
    type: String,
    enum: ['submitted', 'ai_analyzing', 'pending_review', 'approved', 'rejected', 'info_requested', 'funds_released'],
    default: 'submitted'
  },
  officerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer' },
  verification: {
    decision: { type: String, enum: ['approved', 'rejected', 'info_requested'] },
    comments: String,
    verifiedAt: Date,
    requestedInfo: String
  },
  funds: {
    amount: Number,
    releasedAt: Date,
    transactionId: String
  }
}, { timestamps: true });

claimSchema.index({ farmerId: 1, status: 1 });
claimSchema.index({ officerId: 1, status: 1 });
claimSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Claim', claimSchema);
