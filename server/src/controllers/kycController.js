const User = require('../models/User');

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

async function uploadToCloudinary(base64Data) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  const timestamp = Math.round((new Date).getTime() / 1000);
  const signatureStr = `timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');
  
  const formData = new URLSearchParams();
  formData.append('file', base64Data);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  
  // Notice we use native node fetch, so we don't need any broken NPM SDKs!
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Cloudinary upload failed');
  }
  
  const data = await response.json();
  return data.secure_url; // Cloudinary's encrypted persistent URL
}

// Upload KYC Documents (Cloudinary Cloud Migration)
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

    // Parallel upload all chunks to Cloudinary
    for (const doc of documents) {
      const url = await uploadToCloudinary(doc.data);
      filePaths.push(url);
    }

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
