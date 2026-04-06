const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const auth = require('../middleware/auth');

// @route   GET api/cards
// @desc    Get all cards for user
// @access  Private
router.get('/', auth, cardController.getCards);

// @route   POST api/cards
// @desc    Create a new card
// @access  Private
router.post('/', auth, cardController.createCard);

// @route   PUT api/cards/:id/toggle
// @desc    Freeze/Unfreeze card
// @access  Private
router.put('/:id/toggle', auth, cardController.toggleCardStatus);

module.exports = router;
