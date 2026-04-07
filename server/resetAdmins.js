const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/bank-system').then(async () => {
  const db = mongoose.connection.db;
  const col = db.collection('users');
  
  // Revert all users to standard 'User'
  await col.updateMany({}, { $set: { role: 'User' } });
  
  // Find the oldest user and make them the sole Admin
  const oldestUser = await col.findOne({}, { sort: { createdAt: 1 } });
  if (oldestUser) {
    await col.updateOne({ _id: oldestUser._id }, { $set: { role: 'Admin' } });
    console.log('Made user ' + oldestUser.email + ' the true Admin.');
  }

  process.exit(0);
}).catch(console.error);
