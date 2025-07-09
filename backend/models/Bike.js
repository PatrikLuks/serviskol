// Bike model pro MongoDB (Mongoose)
const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
  name: String,
  type: String,
  condition: String,
  installedAt: Date,
  expectedLifetimeKm: Number
});

const bikeSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  brand: String,
  model: String,
  type: String,
  age: Number,
  components: [componentSchema],
  photoUrls: [String],
  status: { type: String, enum: ['OK', 'NOT_OK'], default: 'OK' },
  mileage: Number,
  serviceHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bike', bikeSchema);
