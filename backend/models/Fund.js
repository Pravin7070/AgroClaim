const mongoose = require('mongoose');

const fundTransactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['CREDIT', 'DEBIT'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    source: {
        type: String, // e.g., "PM Fund" or "Claim Approval"
        required: true
    },
    referenceId: {
        type: String // Optional: Claim ID or meaningful reference
    },
    officerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Officer'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const fundSchema = new mongoose.Schema({
    balance: {
        type: Number,
        default: 0,
        required: true
    },
    transactions: [fundTransactionSchema],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Fund', fundSchema);
