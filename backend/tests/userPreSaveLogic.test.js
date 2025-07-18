const userPreSaveLogic = require('../utils/userPreSaveLogic');

describe('userPreSaveLogic', () => {
  let deps;
  let user;
  beforeEach(() => {
    deps = {
      AuditLog: { create: jest.fn().mockResolvedValue({}) },
      Webhook: { find: jest.fn().mockResolvedValue([]) },
      webhookTrigger: jest.fn(),
      FollowupAutomation: { find: jest.fn().mockResolvedValue([]) },
      Notification: { create: jest.fn().mockResolvedValue({}) },
      now: () => new Date('2025-07-16T12:00:00Z')
    };
    user = { _id: 'u1', aiSegment: 'A', _isModifiedAiSegment: true, _isNew: false };
  });

  it('logs audit and triggers webhooks on aiSegment change', async () => {
    deps.Webhook.find.mockResolvedValueOnce([{ id: 'w1' }]);
    await userPreSaveLogic(user, deps);
    expect(deps.AuditLog.create).toHaveBeenCalledWith(expect.objectContaining({ action: 'ai_segment_change' }));
    expect(deps.webhookTrigger).toHaveBeenCalledWith({ id: 'w1' }, expect.objectContaining({ userId: 'u1', newSegment: 'A' }));
  });

  it('creates followup notification for riziko_odchodu', async () => {
    user.aiSegment = 'riziko_odchodu';
    deps.FollowupAutomation.find.mockResolvedValueOnce([
      { channel: 'in-app', variants: [{ label: 'A', active: true, messageTemplate: 'msg' }], messageTemplate: 'fallback' }
    ]);
    await userPreSaveLogic(user, deps);
    expect(deps.Notification.create).toHaveBeenCalledWith(expect.objectContaining({ type: 'followup', message: 'msg', variant: 'A' }));
  });

  it('falls back to messageTemplate if no active variants', async () => {
    user.aiSegment = 'riziko_odchodu';
    deps.FollowupAutomation.find.mockResolvedValueOnce([
      { channel: 'in-app', variants: [], messageTemplate: 'fallback' }
    ]);
    await userPreSaveLogic(user, deps);
    expect(deps.Notification.create).toHaveBeenCalledWith(expect.objectContaining({ message: 'fallback' }));
  });

  it('ignores errors in logic', async () => {
    deps.AuditLog.create.mockImplementationOnce(() => { throw new Error('fail'); });
    await expect(userPreSaveLogic(user, deps)).resolves.toBeUndefined();
  });

  it('does nothing if aiSegment not modified or isNew', async () => {
    user._isModifiedAiSegment = false;
    await userPreSaveLogic(user, deps);
    expect(deps.AuditLog.create).not.toHaveBeenCalled();
    user._isModifiedAiSegment = true;
    user._isNew = true;
    await userPreSaveLogic(user, deps);
    expect(deps.AuditLog.create).not.toHaveBeenCalled();
  });
});
