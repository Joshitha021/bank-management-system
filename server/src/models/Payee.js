const mongoose = require('mongoose');

const payeeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 50
  },
  accountNumber: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 10
  }
}, { timestamps: true });

// Prevent a user from saving the same account number twice under different names
payeeSchema.index({ user: 1, accountNumber: 1 }, { unique: true });

module.exports = mongoose.model('Payee', payeeSchema);
