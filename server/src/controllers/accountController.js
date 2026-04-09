const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

// Get all accounts for logged in user
exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user.id });
    res.json({ success: true, accounts });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create a new account
exports.createAccount = async (req, res) => {
  try {
    const { type, initialDeposit } = req.body;
    
    const account = new Account({
      user: req.user.id,
      type: type || 'Savings',
      balance: initialDeposit || 0
    });

    await account.save();

    // If there is an initial deposit, formally log it into the centralized transaction ledger
    if (initialDeposit && Number(initialDeposit) > 0) {
      const genesisTx = new Transaction({
        user: req.user.id,
        account: account._id,
        type: 'Deposit',
        amount: Number(initialDeposit),
        description: 'Account Initialization Deposit',
        category: 'Income',
        status: 'Completed'
      });
      await genesisTx.save();
    }

    res.status(201).json({ success: true, account });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};
