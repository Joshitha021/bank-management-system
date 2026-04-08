const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

router.get('/stats', auth, adminAuth, adminController.getStats);
router.get('/users', auth, adminAuth, adminController.getUsers);
router.put('/users/:id', auth, adminAuth, adminController.updateUser);
router.put('/kyc/:id', auth, adminAuth, adminController.reviewKyc);

module.exports = router;
