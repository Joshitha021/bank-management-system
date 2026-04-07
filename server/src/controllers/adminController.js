const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

// Get overview stats
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const accounts = await Account.find();
    const totalBalance = accounts.reduce((acc, account) => acc + account.balance, 0);
    const transactions = await Transaction.countDocuments();
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalBalance,
        totalTransactions: transactions,
        totalAccounts: accounts.length
      }
    });
  } catch (err) {
    console.error('Admin getStats error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    console.error('Admin getUsers error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
