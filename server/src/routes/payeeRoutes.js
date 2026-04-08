const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const payeeController = require('../controllers/payeeController');

// @route   GET /api/payees
// @desc    Get user's saved payees
// @access  Private
router.get('/', auth, payeeController.getPayees);

// @route   POST /api/payees
// @desc    Save a new payee
// @access  Private
router.post('/', auth, payeeController.addPayee);

// @route   DELETE /api/payees/:id
// @desc    Delete a saved payee
// @access  Private
router.delete('/:id', auth, payeeController.deletePayee);

module.exports = router;
