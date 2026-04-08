const User = require('../models/User');

const fs = require('fs');
const path = require('path');

// Upload KYC Documents (JSON Base64 parser instead of Multer)
exports.uploadDocuments = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { documents } = req.body;
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ success: false, message: 'No documents provided' });
    }

    const filePaths = [];

    // Parse base64 and write securely to disk
    documents.forEach((doc, index) => {
      // doc.data looks like: 'data:image/png;base64,iVBORw0KGgo...'
      const matches = doc.data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) return;

      const extension = matches[1].split('/')[1] === 'jpeg' ? 'jpg' : matches[1].split('/')[1];
      const buffer = Buffer.from(matches[2], 'base64');
      
      const fileName = `${req.user.id}-${Date.now()}-${index}.${extension}`;
      const savePath = path.join(__dirname, '../../uploads/kyc', fileName);
      
      fs.writeFileSync(savePath, buffer);
      filePaths.push(`/uploads/kyc/${fileName}`);
    });

    // Update user schema
    user.kycStatus = 'Pending';
    user.kycDocuments = [...user.kycDocuments, ...filePaths];
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: 'KYC Documents uploaded successfully. Your status is now Pending.',
      kycStatus: user.kycStatus 
    });

  } catch (err) {
    console.error('KYC Upload error:', err);
    res.status(500).json({ success: false, message: 'Server error processing KYC upload' });
  }
};

// Check KYC Status
exports.getKycStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('kycStatus kycDocuments');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ 
      success: true, 
      kycStatus: user.kycStatus,
      documentsCount: user.kycDocuments.length
    });
  } catch (err) {
    console.error('Check KYC status error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching KYC status' });
  }
};
