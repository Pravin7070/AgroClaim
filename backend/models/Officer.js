const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const officerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  password: { type: String, required: true, select: false },
  employeeId: { type: String, required: true, unique: true },
  district: { type: String, required: true },
  role: { type: String, default: 'officer' }
}, { timestamps: true });

officerSchema.index({ email: 1 });

officerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

officerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Officer', officerSchema);
