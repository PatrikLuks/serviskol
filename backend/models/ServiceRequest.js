// ServiceRequest model pro MongoDB (Mongoose)
const { mongoose, registerModel } = require('../db');

const serviceRequestSchema = new mongoose.Schema({
  bikeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bike', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mechanicId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['Initial', 'Complex', 'QuickFix'], required: true },
  description: String,
  photoUrls: [String],
  aiDiagnosis: String,
  status: { type: String, enum: ['Open', 'InProgress', 'Done', 'WaitingApproval', 'Assigned', 'WaitingParts', 'Cancelled'], default: 'Open' },
  statusHistory: [
    {
      status: String,
      changedAt: { type: Date, default: Date.now },
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }
  ],
  createdAt: { type: Date, default: Date.now },
  startTime: Date,
  endTime: Date,
  priceEstimate: Number
});

module.exports = registerModel('ServiceRequest', serviceRequestSchema);
