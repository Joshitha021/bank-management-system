const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  type: {
    type: String,
    enum: ['Transfer', 'Deposit', 'Withdrawal', 'Payment'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    default: 'General'
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Completed', 'Pending', 'Failed'],
    default: 'Completed'
  },
  recipientAccount: {
    type: String, // Keep as string to allow outward transfers
    default: null
  },
  referenceNumber: {
    type: String,
    unique: true,
    default: () => 'TXN' + Date.now() + Math.floor(Math.random() * 1000)
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
