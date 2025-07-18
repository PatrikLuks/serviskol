const mongoose = require('mongoose');

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/serviskol_test');
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});
