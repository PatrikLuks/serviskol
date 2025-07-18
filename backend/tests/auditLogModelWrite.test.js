const mongoose = require('mongoose');
const AuditLog = require('../models/AuditLog');

describe('AuditLog model direct write', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/serviskol');
    }
  });
  afterAll(async () => {
    await AuditLog.deleteMany({ action: 'TEST_WRITE' });
    await mongoose.disconnect();
  });
  it('should write and read an audit log entry directly', async () => {
    const entry = await AuditLog.create({
      action: 'TEST_WRITE',
      performedBy: new mongoose.Types.ObjectId(),
      details: { foo: 'bar' }
    });
    expect(entry).toBeDefined();
    const found = await AuditLog.findOne({ _id: entry._id });
    expect(found).toBeDefined();
    expect(found.action).toBe('TEST_WRITE');
    expect(found.details.foo).toBe('bar');
  });
});
