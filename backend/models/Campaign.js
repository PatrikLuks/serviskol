const { mongoose, registerModel } = require('../db');

const variantSchema = new mongoose.Schema({
  label: { type: String, required: true }, // např. "A", "B"
  text: { type: String, required: true },
  faq: { type: String },
  sentCount: { type: Number, default: 0 },
  clickCount: { type: Number, default: 0 }
});

const campaignSchema = new mongoose.Schema({
  tema: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  scheduledAt: { type: Date }, // plánované odeslání
  status: { type: String, enum: ['scheduled', 'sent', 'winner_sent'], default: 'sent' },
  segment: {
    type: Object, // např. { role: 'user', region: 'Praha' }
    default: {}
  },
  variants: [variantSchema],
  winnerVariant: { type: String }, // label vítězné varianty
  autoSelectWinner: { type: Boolean, default: false },
  launchedBy: { type: String }, // admin email nebo systém
  type: { type: String, enum: ['manual', 'auto'], default: 'manual' }
});

module.exports = registerModel('Campaign', campaignSchema);
