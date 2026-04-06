const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cardNumber: {
    type: String,
    required: true,
    unique: true,
    default: () => '4' + Math.floor(100000000000000 + Math.random() * 900000000000000).toString()
  },
  cardHolder: {
    type: String,
    required: true
  },
  expiryDate: {
    type: String, // format MM/YY
    required: true,
    default: () => {
      const today = new Date();
      const expiryYear = today.getFullYear() + 3;
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      return `${month}/${expiryYear.toString().slice(-2)}`;
    }
  },
  cvv: {
    type: String,
    required: true,
    default: () => Math.floor(100 + Math.random() * 900).toString()
  },
  type: {
    type: String,
    enum: ['Debit', 'Credit', 'Virtual'],
    default: 'Virtual'
  },
  limit: {
    type: Number,
    default: 5000
  },
  status: {
    type: String,
    enum: ['Active', 'Frozen', 'Expired'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Card', cardSchema);
