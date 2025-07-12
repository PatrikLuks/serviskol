// Decision tree predikce nejlepšího kanálu
userSchema.statics.decisionTreeChannel = function(user) {
  // Základní pravidla (lze rozšířit):
  // 1. Pokud uživatel preferuje kanál a engagement v něm > 0, vrať ho
  if (user.preferredChannel && user.channelEngagement && user.channelEngagement[user.preferredChannel.replace('-', '')] > 0) {
    return { channel: user.preferredChannel, reason: 'Preferovaný kanál s historií engagementu' };
  }
  // 2. Pokud je uživatel mladší 30 a push má engagement > email, preferuj push
  if (user.age && user.age < 30 && user.channelEngagement && (user.channelEngagement.push || 0) > (user.channelEngagement.email || 0)) {
    return { channel: 'push', reason: 'Mladý uživatel, push má vyšší engagement než email' };
  }
  // 3. Pokud je uživatel starší 50 a email má engagement > push, preferuj email
  if (user.age && user.age > 50 && user.channelEngagement && (user.channelEngagement.email || 0) > (user.channelEngagement.push || 0)) {
    return { channel: 'email', reason: 'Starší uživatel, email má vyšší engagement než push' };
  }
  // 4. Pokud region je 'Praha' a engagement v in-app > ostatní, preferuj in-app
  if (user.region === 'Praha' && user.channelEngagement && (user.channelEngagement.inApp || 0) > Math.max(user.channelEngagement.email || 0, user.channelEngagement.push || 0, user.channelEngagement.sms || 0)) {
    return { channel: 'in-app', reason: 'Praha, in-app má nejvyšší engagement' };
  }
  // 5. Jinak kanál s nejvyšším engagementem
  if (user.channelEngagement) {
    const entries = Object.entries(user.channelEngagement);
    const best = entries.reduce((a, b) => (b[1] > a[1] ? b : a), entries[0]);
    if (best[1] > 0) return { channel: best[0] === 'inApp' ? 'in-app' : best[0], reason: 'Nejvyšší historický engagement' };
  }
  // 6. Fallback: preferovaný kanál nebo in-app
  return { channel: user.preferredChannel || 'in-app', reason: 'Výchozí/fallback' };
};
// AI predikce nejlepšího kanálu pro uživatele
userSchema.statics.predictBestChannel = function(user) {
  if (!user.channelEngagement) return user.preferredChannel || 'in-app';
  // Pokud má preferovaný kanál s engagementem > 0, vrať ho
  if (user.preferredChannel && user.channelEngagement[user.preferredChannel.replace('-', '')] > 0) {
    return user.preferredChannel;
  }
  // Jinak kanál s nejvyšším engagementem
  const entries = Object.entries(user.channelEngagement);
  const best = entries.reduce((a, b) => (b[1] > a[1] ? b : a), entries[0]);
  if (best[1] > 0) return best[0] === 'inApp' ? 'in-app' : best[0];
  return user.preferredChannel || 'in-app';
};
// User model pro MongoDB (Mongoose)

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['client', 'mechanic', 'admin'], required: true },
  adminRole: { type: String, enum: ['superadmin', 'approver', 'readonly'], default: 'approver' },
  adminRole: { type: String, enum: ['superadmin', 'approver', 'readonly'], default: 'approver' },
  loyaltyLevel: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], default: 'Bronze' },
  bikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bike' }],
  createdAt: { type: Date, default: Date.now },
  region: { type: String },
  age: { type: Number },
  lastLogin: { type: Date },
  engagementScore: { type: Number, default: 0 },
  pushToken: { type: String }, // FCM nebo OneSignal token
  notificationChannel: { type: String, enum: ['in-app', 'email', 'push'], default: 'in-app' },
  twoFactorSecret: { type: String }, // base32
  twoFactorEnabled: { type: Boolean, default: false },
  campaignClicks: [{
    campaign: { type: String }, // tema nebo campaignId
    variant: { type: String },
    faq: { type: String },
    clickedAt: { type: Date, default: Date.now },
    channel: { type: String } // in-app, email, push, sms
  }],
  preferredChannel: { type: String, enum: ['in-app', 'email', 'push', 'sms'], default: 'in-app' },
  channelEngagement: {
    inApp: { type: Number, default: 0 },
    email: { type: Number, default: 0 },
    push: { type: Number, default: 0 },
    sms: { type: Number, default: 0 }
  }
});

// Hashování hesla před uložením
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('User', userSchema);
