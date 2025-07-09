// User model pro MongoDB (Mongoose)
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['client', 'mechanic'], required: true },
  loyaltyLevel: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], default: 'Bronze' },
  bikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bike' }],
  createdAt: { type: Date, default: Date.now },
  pushToken: { type: String }, // FCM nebo OneSignal token
  notificationChannel: { type: String, enum: ['in-app', 'email', 'push'], default: 'in-app' },
  twoFactorSecret: { type: String }, // base32
  twoFactorEnabled: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);
