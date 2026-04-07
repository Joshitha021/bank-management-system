const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

// Get all transactions for the user
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .populate('account', 'accountNumber type bg')
      .sort({ createdAt: -1 });
    res.json({ success: true, transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Perform a transfer between own accounts or to an external account number
exports.createTransfer = async (req, res) => {
  try {
    const { fromAccountId, toAccountNumber, amount, description, category, otp } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    // 1. Validate From Account
    const fromAccount = await Account.findOne({ _id: fromAccountId, user: req.user.id });
    if (!fromAccount) {
      return res.status(404).json({ success: false, message: 'Source account not found' });
    }

    if (fromAccount.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient funds' });
    }

    // 2. 2FA Check for High Value Transfers (> ₹10,000)
    if (amount > 10000) {
      const Otp = require('../models/Otp');
      if (!otp) {
        // Generate OTP
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Clear existing unresolved OTPs
        await Otp.deleteMany({ userId: req.user.id, action: 'HighValueTransfer' });
        
        // Save new OTP
        const newOtp = new Otp({
          userId: req.user.id,
          code,
          expiresAt: new Date(Date.now() + 5 * 60000), // 5 minutes
          action: 'HighValueTransfer'
        });
        await newOtp.save();

        // Send Email
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        const sendEmail = require('../utils/emailUtils');
        await sendEmail({
          email: user.email,
          subject: 'Action Required: High Value Transfer OTP',
          message: `Your One-Time Password for the transfer of ₹${amount.toLocaleString()} is: ${code}. It expires in 5 minutes.`
        });

        return res.status(202).json({ 
          success: false, 
          requireOTP: true, 
          message: 'An OTP has been sent to your registered email.' 
        });
      } else {
        // Verify OTP
        const validOtp = await Otp.findOne({ userId: req.user.id, action: 'HighValueTransfer', code: otp });
        if (!validOtp) {
          return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }
        // OTP valid, delete it
        await Otp.deleteOne({ _id: validOtp._id });
      }
    }

    // 2. Determine To Account (Internal or External)
    const toAccount = await Account.findOne({ accountNumber: toAccountNumber });
    
    // 3. Perform Transaction (Simulate atomic using basic math for now, realistic apps use mongoose sessions)
    fromAccount.balance -= amount;
    await fromAccount.save();

    if (toAccount) {
      toAccount.balance += amount;
      await toAccount.save();
    }

    // 4. Record Transaction forSender
    const transaction = new Transaction({
      user: req.user.id,
      account: fromAccountId,
      type: 'Transfer',
      amount: -amount,
      category: category || 'Transfer',
      description: description || `Transfer to ${toAccountNumber}`,
      status: 'Completed',
      recipientAccount: toAccountNumber
    });
    await transaction.save();

    // 5. If it's an internal transfer (same system), record a matching incoming transaction for recipient
    if (toAccount) {
      const recipientTx = new Transaction({
        user: toAccount.user,
        account: toAccount._id,
        type: 'Transfer',
        amount: amount,
        category: category || 'Transfer',
        description: description || `Transfer from ${req.user.name}`,
        status: 'Completed'
      });
      await recipientTx.save();
    }

    res.status(201).json({ success: true, transaction, newBalance: fromAccount.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Simulate an incoming deposit (for demo purposes)
exports.simulateDeposit = async (req, res) => {
  try {
    const { accountId, amount, description } = req.body;

    const account = await Account.findOne({ _id: accountId, user: req.user.id });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    account.balance += amount;
    await account.save();

    const transaction = new Transaction({
      user: req.user.id,
      account: account._id,
      type: 'Deposit',
      amount: amount,
      category: 'Income',
      description: description || 'Bank Deposit',
      status: 'Completed'
    });
    
    await transaction.save();
    res.status(201).json({ success: true, transaction, newBalance: account.balance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
