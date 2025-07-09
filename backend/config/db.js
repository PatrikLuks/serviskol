// Konfigurace připojení k MongoDB
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/serviskol', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB připojeno');
  } catch (err) {
    console.error('Chyba připojení k MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
