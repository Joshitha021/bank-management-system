const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const kycController = require('../controllers/kycController');

// @route   POST /api/kyc/upload
// @desc    Upload documents to initiate KYC verification (Mocked to bypass Multer network error)
// @access  Private
router.post('/upload', auth, kycController.uploadDocuments);

// @route   GET /api/kyc/status
// @desc    Get user's current KYC status
// @access  Private
router.get('/status', auth, kycController.getKycStatus);

module.exports = router;
