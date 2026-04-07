const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '5m' } // Document will automatically be deleted by MongoDB after 5 mins
  },
  action: {
    type: String,
    enum: ['HighValueTransfer'],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Otp', otpSchema);
