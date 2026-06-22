const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const farmerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  password: { type: String, required: true, select: false },
  address: {
    village: String,
    district: String,
    state: String,
    pincode: String
  },
  aadhaar: { type: String, unique: true, sparse: true },
  landSize: { type: Number, default: 0 },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    accountHolderName: String
  },
  kycStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  profileComplete: { type: Boolean, default: false },
  role: { type: String, default: 'farmer' }
}, { timestamps: true });

farmerSchema.index({ email: 1 });
farmerSchema.index({ aadhaar: 1 });

farmerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

farmerSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Farmer', farmerSchema);
