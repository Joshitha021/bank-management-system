const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');

// @route   GET api/transactions
router.get('/', auth, transactionController.getTransactions);

// @route   POST api/transactions/transfer
router.post('/transfer', auth, transactionController.createTransfer);

// @route   POST api/transactions/deposit
router.post('/deposit', auth, transactionController.simulateDeposit);

module.exports = router;
