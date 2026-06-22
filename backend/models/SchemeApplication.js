const mongoose = require('mongoose');

const schemeApplicationSchema = new mongoose.Schema({
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
    schemeName: { type: String, required: true },
    schemeType: { type: String, enum: ['Central', 'State'], required: true }, // India or Tamil Nadu
    category: { type: String, required: true },
    applicationData: {
        fullName: String,
        phone: String,
        addressLine: String,
        district: String,
        taluka: String,
        village: String,
        aadhaar: String,
        bankAccount: String
    },
    documents: [{
        name: String,
        url: String,
        uploadedAt: Date
    }],
    requiredDocuments: [String],
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'InfoRequested'],
        default: 'Pending'
    },
    officerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer' },
    reviewComments: String,
    requestedInfo: String,
    sanctionedAmount: { type: Number, default: 0 },
    processedAt: Date
}, { timestamps: true });

schemeApplicationSchema.index({ farmerId: 1, status: 1 });
schemeApplicationSchema.index({ schemeName: 1 });

module.exports = mongoose.model('SchemeApplication', schemeApplicationSchema);
