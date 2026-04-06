const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const auth = require('../middleware/auth');

// @route   GET api/accounts
// @desc    Get all accounts for user
// @access  Private
router.get('/', auth, accountController.getAccounts);

// @route   POST api/accounts
// @desc    Create an account
// @access  Private
router.post('/', auth, accountController.createAccount);

module.exports = router;
