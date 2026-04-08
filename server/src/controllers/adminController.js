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

// Update user details
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();
    
    // Return the updated user without the password field
    const updatedUser = await User.findById(id).select('-password');
    res.json({ success: true, user: updatedUser });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    console.error('Admin updateUser error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin Review KYC Documents
exports.reviewKyc = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Verified' or 'Rejected'

    if (!['Verified', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid KYC status designation' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Process the documents logic
    user.kycStatus = status;
    
    // Optionally: if rejected, wipe the current documents array so they can re-upload safely
    if (status === 'Rejected') {
      user.kycDocuments = [];
    }

    await user.save();
    
    res.status(200).json({ 
      success: true, 
      message: `User KYC officially mapped to ${status}`, 
      user: await User.findById(id).select('-password') 
    });

  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    console.error('Admin review KYC error:', err.message);
    res.status(500).json({ success: false, message: 'Server error parsing KYC request' });
  }
};
