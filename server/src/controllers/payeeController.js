const Payee = require('../models/Payee');
const Account = require('../models/Account');

// Get all saved payees for the logged-in user
exports.getPayees = async (req, res) => {
  try {
    const payees = await Payee.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, payees });
  } catch (err) {
    console.error('Error fetching payees:', err);
    res.status(500).json({ success: false, message: 'Server error fetching payees' });
  }
};

// Add a new payee
exports.addPayee = async (req, res) => {
  try {
    const { name, accountNumber } = req.body;

    if (!name || !accountNumber) {
      return res.status(400).json({ success: false, message: 'Please provide payee name and account number' });
    }

    if (accountNumber.length !== 10) {
      return res.status(400).json({ success: false, message: 'Account number must be exactly 10 digits' });
    }

    // Optional Check: Is this a valid account in our bank?
    const accountExists = await Account.findOne({ accountNumber });
    if (!accountExists) {
      return res.status(404).json({ success: false, message: 'Account number is not recognized by the bank' });
    }

    // Prevent adding their own account as payee? Optional, let's allow it just for convenience.

    const payee = new Payee({
      user: req.user.id,
      name,
      accountNumber
    });

    await payee.save();

    res.status(201).json({ success: true, message: 'Payee saved successfully', payee });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'This account number is already saved in your address book' });
    }
    console.error('Error adding payee:', err);
    res.status(500).json({ success: false, message: 'Server error adding payee' });
  }
};

// Delete a payee
exports.deletePayee = async (req, res) => {
  try {
    const payee = await Payee.findById(req.params.id);

    if (!payee) {
      return res.status(404).json({ success: false, message: 'Payee not found' });
    }

    // Guarantee the user owns this payee
    if (payee.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this payee' });
    }

    await payee.deleteOne();

    res.status(200).json({ success: true, message: 'Payee removed' });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Payee not found' });
    }
    console.error('Error deleting payee:', err);
    res.status(500).json({ success: false, message: 'Server error deleting payee' });
  }
};
