const mongoose = require('mongoose');
const User = require('../models/User');

jest.mock('../models/AuditLog', () => ({
  create: jest.fn().mockResolvedValue({})
}));
jest.mock('../models/Webhook', () => ({
  find: jest.fn().mockResolvedValue([])
}));
jest.mock('../utils/webhookTrigger', () => jest.fn());
jest.mock('../models/Notification', () => ({
  create: jest.fn().mockResolvedValue({})
}));
jest.mock('../models/FollowupAutomation', () => ({
  find: jest.fn().mockResolvedValue([])
}));

describe('User pre-save hook', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log audit and trigger webhooks on aiSegment change', async () => {
    const user = new User({
      name: 'Test', email: 'a@b.cz', passwordHash: 'x', role: 'client', aiSegment: 'A',
      _id: new mongoose.Types.ObjectId()
    });
    user.isNew = false;
    user.isModified = field => field === 'aiSegment';
    user._isModifiedAiSegment = true;
    user._isNew = false;
    user.save = jest.fn().mockImplementation(async function() {
      const userPreSaveLogic = require('../utils/userPreSaveLogic');
      await userPreSaveLogic(this);
      return this;
    });
    await user.save();
    const AuditLog = require('../models/AuditLog');
    expect(AuditLog.create).toHaveBeenCalled();
    const webhookTrigger = require('../utils/webhookTrigger');
    expect(webhookTrigger).not.toHaveBeenCalled(); // žádné webhooky v mocku
  });

  it('should create followup notification for riziko_odchodu', async () => {
    const FollowupAutomation = require('../models/FollowupAutomation');
    FollowupAutomation.find.mockResolvedValueOnce([
      { channel: 'in-app', variants: [{ label: 'A', active: true, messageTemplate: 'msg' }], messageTemplate: 'fallback' }
    ]);
    const user = new User({
      name: 'Test', email: 'a@b.cz', passwordHash: 'x', role: 'client', aiSegment: 'riziko_odchodu',
      _id: new mongoose.Types.ObjectId()
    });
    user.isNew = false;
    user.isModified = field => field === 'aiSegment';
    user._isModifiedAiSegment = true;
    user._isNew = false;
    user.save = jest.fn().mockImplementation(async function() {
      const userPreSaveLogic = require('../utils/userPreSaveLogic');
      await userPreSaveLogic(this);
      return this;
    });
    await user.save();
    const Notification = require('../models/Notification');
    expect(Notification.create).toHaveBeenCalledWith(expect.objectContaining({ type: 'followup' }));
  });

  it('should fallback to messageTemplate if no active variants', async () => {
    const FollowupAutomation = require('../models/FollowupAutomation');
    FollowupAutomation.find.mockResolvedValueOnce([
      { channel: 'in-app', variants: [], messageTemplate: 'fallback' }
    ]);
    const user = new User({
      name: 'Test', email: 'a@b.cz', passwordHash: 'x', role: 'client', aiSegment: 'riziko_odchodu',
      _id: new mongoose.Types.ObjectId()
    });
    user.isNew = false;
    user.isModified = field => field === 'aiSegment';
    user._isModifiedAiSegment = true;
    user._isNew = false;
    user.save = jest.fn().mockImplementation(async function() {
      const userPreSaveLogic = require('../utils/userPreSaveLogic');
      await userPreSaveLogic(this);
      return this;
    });
    await user.save();
    const Notification = require('../models/Notification');
    expect(Notification.create).toHaveBeenCalledWith(expect.objectContaining({ message: 'fallback' }));
  });

  it('should not fail if error is thrown in hook', async () => {
    const AuditLog = require('../models/AuditLog');
    AuditLog.create.mockImplementationOnce(() => { throw new Error('fail'); });
    const user = new User({
      name: 'Test', email: 'a@b.cz', passwordHash: 'x', role: 'client', aiSegment: 'A',
      _id: new mongoose.Types.ObjectId()
    });
    user.isNew = false;
    user.isModified = field => field === 'aiSegment';
    user._isModifiedAiSegment = true;
    user._isNew = false;
    user.save = jest.fn().mockImplementation(async function() {
      const userPreSaveLogic = require('../utils/userPreSaveLogic');
      await userPreSaveLogic(this);
      return this;
    });
    await expect(user.save()).resolves.toBeDefined();
  });
});
