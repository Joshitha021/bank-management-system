const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'dark'
  },
  notificationsEnabled: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['User', 'Admin'],
    default: 'User'
  },
  kycStatus: {
    type: String,
    enum: ['Unverified', 'Pending', 'Verified', 'Rejected'],
    default: 'Unverified'
  },
  kycDocuments: [{
    type: String // We'll store the local file path or URL here
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
