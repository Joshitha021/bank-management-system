const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/bank-system').then(async () => {
  const db = mongoose.connection.db;
  const col = db.collection('users');
  await col.updateMany({}, { $set: { role: 'Admin' } });
  console.log('Upgraded all existing users to Admin!');
  process.exit(0);
}).catch(console.error);
