const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true,
    default: () => Math.floor(1000000000 + Math.random() * 9000000000).toString()
  },
  type: {
    type: String,
    enum: ['Savings', 'Checking', 'Fixed Deposit'],
    default: 'Savings'
  },
  balance: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['Active', 'Dormant', 'Closed'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);
