const Card = require('../models/Card');
const Account = require('../models/Account');

// Get all cards for logged in user
exports.getCards = async (req, res) => {
  try {
    const cards = await Card.find({ user: req.user.id }).populate('account', 'accountNumber type');
    res.json({ success: true, cards });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create a new card
exports.createCard = async (req, res) => {
  try {
    const { accountId, type, limit } = req.body;
    
    // Check if account belongs to user
    const account = await Account.findOne({ _id: accountId, user: req.user.id });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    const card = new Card({
      user: req.user.id,
      account: accountId,
      cardHolder: req.user.name || 'Demo User',
      type: type || 'Virtual',
      limit: limit || 5000
    });

    await card.save();
    res.status(201).json({ success: true, card });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Toggle card status (Freeze/Unfreeze)
exports.toggleCardStatus = async (req, res) => {
  try {
    const card = await Card.findOne({ _id: req.params.id, user: req.user.id });
    if (!card) {
      return res.status(404).json({ success: false, message: 'Card not found' });
    }

    if (card.status === 'Active') {
      card.status = 'Frozen';
    } else if (card.status === 'Frozen') {
      card.status = 'Active';
    } else {
      return res.status(400).json({ success: false, message: 'Card cannot be modified' });
    }

    await card.save();
    res.json({ success: true, card });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
